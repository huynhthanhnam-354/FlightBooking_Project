package com.flightbooking.service;

import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.time.VietnamTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingTimeoutScheduler {

    private final BookingRepository bookingRepository;
    private final ComboService comboService;
    private final SeatHoldService seatHoldService;

    @Scheduled(cron = "*/30 * * * * *")
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
                booking.setStatus(BookingStatus.EXPIRED);
                booking.setSeatNumber(null);
                log.info("System Scheduler: PNR {} status changed to EXPIRED and seat number nullified.", booking.getPnr());
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
}
