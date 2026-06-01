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
import com.flightbooking.web.dto.BaggageUpdateRequest;
import com.flightbooking.web.dto.BookingAdminSummaryResponse;
import com.flightbooking.web.dto.CheckInRequest;
import com.flightbooking.web.dto.CreateBookingRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
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
        int baggageKg = normalizeBaggageKg(request.baggageKg());
        long baggageFeeVnd = normalizeBaggageFee(request.baggageFeeVnd());

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
                .baggageKg(baggageKg)
                .baggageFeeVnd(baggageFeeVnd)
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
    public List<BookingResponse> listAllForAdmin() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingAdminSummaryResponse adminSummary() {
        long pending = bookingRepository.countByStatus(BookingStatus.PENDING_PAYMENT);
        long confirmed = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long checkedIn = bookingRepository.countByStatus(BookingStatus.CHECKED_IN);
        long completed = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        long cancelled = bookingRepository.countByStatus(BookingStatus.CANCELLED);
        List<Booking> bookings = bookingRepository.findAll();
        long revenue = bookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .mapToLong(b -> b.getTotalPriceVnd() == null ? 0L : b.getTotalPriceVnd())
                .sum();
        long baggageRevenue = bookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .mapToLong(b -> b.getBaggageFeeVnd() == null ? 0L : b.getBaggageFeeVnd())
                .sum();
        return new BookingAdminSummaryResponse(
                bookings.size(),
                pending,
                confirmed,
                checkedIn,
                completed,
                cancelled,
                revenue,
                baggageRevenue,
                Map.of(
                        "PENDING_PAYMENT", pending,
                        "CONFIRMED", confirmed,
                        "CHECKED_IN", checkedIn,
                        "COMPLETED", completed,
                        "CANCELLED", cancelled
                )
        );
    }

    @Transactional
    public BookingResponse updateBaggage(String userEmail, Long bookingId, BaggageUpdateRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Booking not found");
        }

        int baggageKg = normalizeBaggageKg(request.baggageKg());
        long newFee = normalizeBaggageFee(request.baggageFeeVnd());
        long oldFee = booking.getBaggageFeeVnd() == null ? 0L : booking.getBaggageFeeVnd();
        booking.setBaggageKg(baggageKg);
        booking.setBaggageFeeVnd(newFee);
        booking.setTotalPriceVnd(Math.max(0L, booking.getTotalPriceVnd() - oldFee + newFee));
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse checkIn(String userEmail, CheckInRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        Booking booking = bookingRepository.findByPnrIgnoreCase(clean(request.pnr()))
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Booking not found");
        }
        if (booking.getStatus() == BookingStatus.PENDING_PAYMENT) {
            throw new IllegalArgumentException("Booking must be paid before check-in");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("Booking cannot be checked in");
        }
        String expectedLastName = lastName(booking.getPassengerName());
        String actualLastName = clean(request.passengerLastName());
        if (!Objects.equals(expectedLastName.toLowerCase(Locale.ROOT), actualLastName.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Passenger name does not match");
        }
        booking.setStatus(BookingStatus.CHECKED_IN);
        if (booking.getCheckedInAt() == null) {
            booking.setCheckedInAt(VietnamTime.nowLocal());
        }
        return toResponse(booking);
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
                b.getBaggageKg() == null ? 0 : b.getBaggageKg(),
                b.getBaggageFeeVnd() == null ? 0L : b.getBaggageFeeVnd(),
                b.getTotalPriceVnd(),
                VietnamTime.toInstant(b.getCreatedAt()),
                b.getCheckedInAt() == null ? null : VietnamTime.toInstant(b.getCheckedInAt()),
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

    private static int normalizeBaggageKg(Integer value) {
        if (value == null) {
            return 0;
        }
        if (value < 0 || value > 40) {
            throw new IllegalArgumentException("Invalid baggage package");
        }
        return value;
    }

    private static long normalizeBaggageFee(Long value) {
        if (value == null) {
            return 0L;
        }
        if (value < 0) {
            throw new IllegalArgumentException("Invalid baggage fee");
        }
        return value;
    }

    private static String lastName(String fullName) {
        String cleaned = clean(fullName);
        String[] parts = cleaned.split("\\s+");
        return parts.length == 0 ? cleaned : parts[parts.length - 1];
    }

    private static BookingStatus statusForPayment(String paymentMethod) {
        if ("cod".equalsIgnoreCase(paymentMethod)) {
            return BookingStatus.CONFIRMED;
        }
        return BookingStatus.PENDING_PAYMENT;
    }
}
