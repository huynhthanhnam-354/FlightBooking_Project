package com.flightbooking.service;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.model.Flight;
import com.flightbooking.repository.AppUserRepository;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.web.dto.BookingResponse;
import com.flightbooking.time.VietnamTime;
import com.flightbooking.web.dto.CreateBookingRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AppUserRepository appUserRepository;
    private final FlightService flightService;

    @Transactional
    public BookingResponse create(String userEmail, CreateBookingRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        Flight flight = flightService.getByIdOrThrow(request.flightId());

        String pnr = generatePnr();
        Booking booking = Booking.builder()
                .user(user)
                .flight(flight)
                .seatNumber(request.seatNumber().trim().toUpperCase())
                .passengerName(request.passengerName().trim())
                .passengerEmail(request.passengerEmail() != null ? request.passengerEmail().trim() : null)
                .passengerPhone(request.passengerPhone() != null ? request.passengerPhone().trim() : null)
                .totalPriceVnd(request.totalPriceVnd())
                .status(BookingStatus.CONFIRMED)
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

    private String generatePnr() {
        String pnr;
        int guard = 0;
        do {
            pnr = "SB" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
            guard++;
        } while (bookingRepository.existsByPnr(pnr) && guard < 20);
        if (bookingRepository.existsByPnr(pnr)) {
            pnr = "SB" + System.currentTimeMillis();
        }
        return pnr;
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
