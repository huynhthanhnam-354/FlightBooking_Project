package com.flightbooking.service;

import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.time.VietnamTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingCleanupService {

    private final BookingRepository bookingRepository;

    /**
     * Tự động giải phóng các ghế đang chờ thanh toán nhưng đã quá thời hạn (15 phút).
     * Chạy mỗi 1 phút một lần.
     */
    @Scheduled(fixedRate = 60000) // 60,000 ms = 1 minute
    @Transactional
    public void cleanupExpiredBookings() {
        log.debug("Bắt đầu quét các đơn đặt vé hết hạn...");
        
        List<Booking> expiredBookings = bookingRepository.findByStatusAndExpiresAtBefore(
                BookingStatus.PENDING_PAYMENT, 
                VietnamTime.nowLocal()
        );

        if (!expiredBookings.isEmpty()) {
            log.info("Tìm thấy {} đơn đặt vé hết hạn thanh toán. Đang tiến hành giải phóng ghế...", expiredBookings.size());
            
            for (Booking booking : expiredBookings) {
                booking.setStatus(BookingStatus.EXPIRED);
                log.info("PNR {} đã chuyển sang trạng thái EXPIRED", booking.getPnr());
            }
            
            bookingRepository.saveAll(expiredBookings);
        }
    }
}
