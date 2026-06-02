package com.flightbooking.service;

import com.flightbooking.dto.BookingDTO;
import com.flightbooking.model.AppUser;
import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.model.Flight;
import com.flightbooking.repository.AppUserRepository;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.web.dto.BookingResponse;
import com.flightbooking.time.VietnamTime;
import com.flightbooking.web.dto.CreateBookingRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AppUserRepository appUserRepository;
    private final FlightRepository flightRepository;
    private final FlightService flightService;
    private final EmailService emailService;
    private final PnrGenerator pnrGenerator;

    @Transactional
    public BookingResponse create(String userEmail, CreateBookingRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        
        // Sử dụng Pessimistic Lock để đảm bảo tính nhất quán khi đặt chỗ
        Flight flight = flightRepository.findByIdForUpdate(request.flightId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến bay: " + request.flightId()));

        String pnr = pnrGenerator.generate();
        Booking booking = Booking.builder()
                .user(user)
                .flight(flight)
                .seatNumber(request.seatNumber().trim().toUpperCase())
                .passengerName(request.passengerName().trim())
                .passengerEmail(request.passengerEmail() != null ? request.passengerEmail().trim() : null)
                .passengerPhone(request.passengerPhone() != null ? request.passengerPhone().trim() : null)
                .totalPriceVnd(request.totalPriceVnd())
                .status(BookingStatus.PENDING_PAYMENT)
                .expiresAt(VietnamTime.nowLocal().plusMinutes(15))
                .pnr(pnr)
                .build();
        bookingRepository.save(booking);
        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listMine(String userEmail) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        return bookingRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BookingResponse cancel(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt vé: " + id));

        // Kiểm tra quyền sở hữu
        if (!booking.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn đặt vé này");
        }

        // Kiểm tra trạng thái hiện tại (Chỉ cho phép hủy nếu là PENDING_PAYMENT hoặc CONFIRMED)
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Đơn hàng đã được hủy trước đó");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Không thể hủy chuyến bay đã hoàn thành");
        }

        // Cập nhật trạng thái
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Gửi email thông báo hủy vé
        try {
            Flight flight = booking.getFlight();
            BookingDTO bookingDTO = BookingDTO.builder()
                    .bookingCode(booking.getPnr())
                    .customerName(booking.getPassengerName())
                    .customerEmail(booking.getPassengerEmail())
                    .flightCode(flight.getFlightNumber())
                    .departureCity(flight.getOriginCode())
                    .arrivalCity(flight.getDestinationCode())
                    .departureTime(flight.getDepartureAt())
                    .seatNumber(booking.getSeatNumber())
                    .totalPrice(BigDecimal.valueOf(booking.getTotalPriceVnd()))
                    .build();
            emailService.sendBookingCancellationEmail(bookingDTO);
        } catch (Exception e) {
            // Log lỗi nhưng không làm rollback transaction vì việc hủy vé đã thành công
            // (Log thực tế nên dùng Logger của class)
        }

        return toResponse(booking);
    }

    private BookingResponse toResponse(Booking b) {
        Flight f = b.getFlight();
        return new BookingResponse(
                b.getId(),
                b.getPnr(),
                b.getStatus(),
                b.getSeatNumber(),
                b.getPassengerName(),
                b.getTotalPriceVnd(),
                VietnamTime.toInstant(b.getCreatedAt()),
                flightService.toResponse(f)
        );
    }
}
