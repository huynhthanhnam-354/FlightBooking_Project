package com.flightbooking.service;

import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.repository.TokenBlacklistRepository;
import com.flightbooking.time.VietnamTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingTimeoutScheduler {

    private final BookingRepository bookingRepository;
    private final ComboService comboService;
    private final SeatHoldService seatHoldService;
    private final com.flightbooking.repository.FlightSeatRepository flightSeatRepository;
    private final TokenBlacklistRepository tokenBlacklistRepository;

    @Scheduled(cron = "*/30 * * * * *")
    @SchedulerLock(name = "BookingTimeoutScheduler_releaseExpiredSeats", lockAtLeastFor = "15s", lockAtMostFor = "25s")
    @Transactional
    public void releaseExpiredSeats() {
        log.info("System Scheduler: Scanning for expired pending payment bookings...");
        seatHoldService.cleanupExpired();
        
        List<Booking> expiredBookings = bookingRepository.findByStatusAndExpiresAtBefore(
                BookingStatus.PENDING_PAYMENT, 
                VietnamTime.nowLocal()
        );

        if (!expiredBookings.isEmpty()) {
            log.info("System Scheduler: Found {} expired bookings. Commencing seat release...", expiredBookings.size());
            
            for (Booking booking : expiredBookings) {
                // Release seats in FlightSeat table
                String seatNumStr = booking.getSeatNumber();
                if (seatNumStr != null && !seatNumStr.isBlank() && !"CANCELLED".equalsIgnoreCase(seatNumStr)) {
                    String[] seats = seatNumStr.split(",\\s*");
                    for (String seat : seats) {
                        flightSeatRepository.findByFlightAndSeatNumber(booking.getFlight(), seat.trim().toUpperCase(java.util.Locale.ROOT))
                                .ifPresent(fs -> {
                                    fs.setBooked(false);
                                    flightSeatRepository.save(fs);
                                });
                    }
                }
                booking.setStatus(BookingStatus.EXPIRED);
                log.info("System Scheduler: PNR {} status changed to EXPIRED.", booking.getPnr());
                if (booking.getComboId() != null) {
                    try {
                        comboService.updateAndBroadcastAvailability(booking.getComboId(), null);
                    } catch (Exception e) {
                        log.error("Failed to broadcast combo slot release in scheduler: ", e);
                    }
                }
            }
            
            bookingRepository.saveAll(expiredBookings);
            log.info("System Scheduler: Expired seats batch release completed successfully.");
        }
    }

    /**
     * Dọn dẹp các token JWT hết hạn khỏi Blacklist hàng ngày lúc 3:00 sáng.
     * Sử dụng SchedulerLock để đảm bảo an toàn khi chạy trên môi trường đa node.
     */
    @Scheduled(cron = "0 0 3 * * ?")
    @SchedulerLock(name = "BookingTimeoutScheduler_cleanupExpiredTokens", lockAtLeastFor = "5m", lockAtMostFor = "10m")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("System Scheduler: Commencing cleanup of expired blacklisted JWT tokens...");
        try {
            tokenBlacklistRepository.deleteByExpiredAtBefore(LocalDateTime.now());
            log.info("System Scheduler: Expired blacklisted JWT tokens cleaned up successfully.");
        } catch (Exception e) {
            log.error("System Scheduler: Failed to cleanup expired blacklisted JWT tokens: ", e);
        }
    }
}
