package com.flightbooking.service;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.model.Flight;
import com.flightbooking.repository.AppUserRepository;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.web.dto.BookingResponse;
import com.flightbooking.time.VietnamTime;
import com.flightbooking.validation.InputValidator;
import com.flightbooking.web.dto.CreateBookingRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
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
        String seatNumber = normalizeSeatNumbers(request.seatNumber());
        String passengerName = InputValidator.requirePersonName(request.passengerName());
        String passengerEmail = request.passengerEmail() == null || request.passengerEmail().isBlank()
                ? null
                : InputValidator.requireEmail(request.passengerEmail());
        String passengerPhone = InputValidator.optionalPhone(request.passengerPhone());
        String passengerIdCard = InputValidator.optionalIdCard(request.passengerIdCard());
        Set<String> occupied = occupiedSeatsForFlight(flight);
        for (String seat : parseSeatNumbers(seatNumber)) {
            if (occupied.contains(seat)) {
                throw new IllegalArgumentException("Seat already booked: " + seat);
            }
        }
        int passengerCount = request.passengerCount() == null ? 1 : request.passengerCount();
        String paymentMethod = clean(request.paymentMethod());

        String pnr = generatePnr();
        Booking booking = Booking.builder()
                .user(user)
                .flight(flight)
                .seatNumber(seatNumber)
                .passengerName(passengerName)
                .passengerEmail(passengerEmail)
                .passengerPhone(passengerPhone)
                .passengerIdCard(passengerIdCard)
                .passengerCount(passengerCount)
                .tripType(clean(request.tripType()))
                .paymentMethod(paymentMethod)
                .totalPriceVnd(request.totalPriceVnd())
                .status(statusForPayment(paymentMethod))
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

    @Transactional(readOnly = true)
    public List<String> listOccupiedSeats(Long flightId) {
        Flight flight = flightService.getByIdOrThrow(flightId);
        return occupiedSeatsForFlight(flight).stream().toList();
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
                b.getPassengerEmail(),
                b.getPassengerPhone(),
                b.getPassengerIdCard(),
                b.getPassengerCount(),
                b.getTripType(),
                b.getPaymentMethod(),
                b.getTotalPriceVnd(),
                VietnamTime.toInstant(b.getCreatedAt()),
                flightService.toResponse(f)
        );
    }

    private Set<String> occupiedSeatsForFlight(Flight flight) {
        Set<String> out = new LinkedHashSet<>();
        bookingRepository.findByFlightAndStatusNot(flight, BookingStatus.CANCELLED)
                .forEach(b -> out.addAll(parseSeatNumbers(b.getSeatNumber())));
        return out;
    }

    private static Set<String> parseSeatNumbers(String value) {
        Set<String> out = new LinkedHashSet<>();
        if (value == null || value.isBlank()) {
            return out;
        }
        Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(s -> s.toUpperCase(Locale.ROOT))
                .forEach(out::add);
        return out;
    }

    private static String normalizeSeatNumbers(String value) {
        Set<String> seats = parseSeatNumbers(value);
        if (seats.isEmpty()) {
            throw new IllegalArgumentException("Seat is required");
        }
        return String.join(",", seats);
    }

    private static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private static BookingStatus statusForPayment(String paymentMethod) {
        if ("cod".equalsIgnoreCase(paymentMethod)) {
            return BookingStatus.CONFIRMED;
        }
        return BookingStatus.PENDING_PAYMENT;
    }
}
