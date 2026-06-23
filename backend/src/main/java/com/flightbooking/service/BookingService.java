package com.flightbooking.service;
import com.flightbooking.dto.BookingDTO;
import com.flightbooking.model.AppUser;
import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingPassenger;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.model.Flight;
import com.flightbooking.model.PaymentStatus;
import com.flightbooking.model.PaymentTransaction;
import com.flightbooking.repository.AppUserRepository;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.time.VietnamTime;
import com.flightbooking.validation.InputValidator;
import com.flightbooking.web.dto.BaggageUpdateRequest;
import com.flightbooking.web.dto.BookingAdminSummaryResponse;
import com.flightbooking.web.dto.BookingResponse;
import com.flightbooking.web.dto.CheckInRequest;
import com.flightbooking.web.dto.CreateBookingRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;



@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AppUserRepository appUserRepository;
    private final FlightRepository flightRepository;
    private final FlightService flightService;
    private final EmailService emailService;
    private final PnrGenerator pnrGenerator;

    /**
              * VÁ LỖI 1: Hàm checkSeatAvailability bị thiếu khiến Controller báo lỗi biên dịch
              */
    @Transactional(readOnly = true)
    public boolean checkSeatAvailability(List<String> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) {
            return true;
        }
        // Kiểm tra xem có ghế nào nằm trong danh sách đã bị đặt hay không
        for (String seat : seatIds) {
            long count = bookingRepository.findAll().stream()
                    .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                    .filter(b -> parseSeatNumbers(b.getSeatNumber()).contains(seat.toUpperCase(Locale.ROOT)))
                    .count();
            if (count > 0) {
                return false; // Đã có ít nhất 1 ghế bị đặt trước
            }
        }
        return true;
    }

    /**
         * VÁ LỖI 2: Hàm createBooking nhận CreateBookingRequest từ Controller
         */
    @Transactional
    public Booking createBooking(CreateBookingRequest request) {
        // Tạm thời lấy user mặc định từ hệ thống hoặc anonymous nếu không truyền email trực tiếp
        // Để khớp luồng xử lý không bị null dữ liệu khi demo đặt vé nhanh
        AppUser defaultUser = appUserRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No user found in system database"));
        
        BookingResponse response = create(defaultUser.getEmail(), request);
        return bookingRepository.findById(response.id())
                .orElseThrow(() -> new IllegalArgumentException("Failed to retreive created booking"));
    }

    @Transactional
    public BookingResponse create(String userEmail, CreateBookingRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        Flight flight = flightRepository.findByIdForUpdate(request.flightId())
                .orElseThrow(() -> new IllegalArgumentException("Flight not found: " + request.flightId()));
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
                throw new IllegalStateException("Ghế này đã bị người khác đặt trước, vui lòng chọn ghế khác");
            }
        }
        int passengerCount = request.passengerCount() == null ? 1 : request.passengerCount();
        String paymentMethod = clean(request.paymentMethod());
        int baggageKg = normalizeBaggageKg(request.baggageKg());
        long baggageFeeVnd = normalizeBaggageFee(request.baggageFeeVnd());

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
                .expiresAt(VietnamTime.nowLocal().plusMinutes(10))
                .pnr(pnrGenerator.generate())
                .build();
        for (String seat : parseSeatNumbers(seatNumber)) {
            booking.addPassenger(BookingPassenger.builder()
                    .flight(flight)
                    .seatNumber(seat)
                    .fullName(passengerName)
                    .email(passengerEmail)
                    .phone(passengerPhone)
                    .idCard(passengerIdCard)
                    .build());
        }
        booking.setPaymentTransaction(PaymentTransaction.builder()
                .provider(paymentProvider(paymentMethod))
                .amountVnd(request.totalPriceVnd())
                .status(paymentStatusFor(paymentMethod))
                .paidAt(paymentStatusFor(paymentMethod) == PaymentStatus.MOCK_CONFIRMED ? VietnamTime.nowLocal() : null)
                .providerReference(booking.getPnr())
                .build());
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
    public List<BookingResponse> listSuccessfulBookingsForAdmin() {
        return bookingRepository.findByStatusInOrderByCreatedAtDesc(
                List.of(BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.COMPLETED)
        ).stream()
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
        long onlineCheckedIn = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_IN)
                .filter(b -> "ONLINE".equalsIgnoreCase(b.getCheckInChannel()))
                .count();
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
                onlineCheckedIn,
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
        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Booking not found");
        }
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new IllegalArgumentException("Baggage can only be updated before payment");
        }

        int baggageKg = normalizeBaggageKg(request.baggageKg());
        long newFee = normalizeBaggageFee(request.baggageFeeVnd());
        long oldFee = booking.getBaggageFeeVnd() == null ? 0L : booking.getBaggageFeeVnd();
        booking.setBaggageKg(baggageKg);
        booking.setBaggageFeeVnd(newFee);
        booking.setTotalPriceVnd(Math.max(0L, booking.getTotalPriceVnd() - oldFee + newFee));
        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getTimeRemaining(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        
        long remainingSeconds = 0;
        if (booking.getStatus() == BookingStatus.PENDING_PAYMENT && booking.getExpiresAt() != null) {
            LocalDateTime now = VietnamTime.nowLocal();
            remainingSeconds = java.time.Duration.between(now, booking.getExpiresAt()).getSeconds();
            if (remainingSeconds < 0) {
                remainingSeconds = 0;
            }
        }
        return Map.of("timeRemaining", remainingSeconds);
    }

    @Transactional
    public BookingResponse checkIn(String userEmail, CheckInRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        Booking booking = bookingRepository.findByPnrForUpdate(clean(request.pnr()))
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
        booking.setCheckInChannel("ONLINE");
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse confirmMockPayment(String userEmail, Long bookingId) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Booking not found");
        }
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new IllegalArgumentException("Booking is not waiting for payment");
        }
        booking.setStatus(BookingStatus.CONFIRMED);
        PaymentTransaction payment = booking.getPaymentTransaction();
        if (payment != null) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(VietnamTime.nowLocal());
            payment.setProviderReference(booking.getPnr());
        }
        bookingRepository.save(booking);
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancel(String userEmail, Long bookingId) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Booking not found");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled");
        }
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException("Only pending or confirmed bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(VietnamTime.nowLocal());
        PaymentTransaction payment = booking.getPaymentTransaction();
        if (payment != null && (payment.getStatus() == PaymentStatus.MOCK_CONFIRMED || payment.getStatus() == PaymentStatus.PAID)) {
            payment.setStatus(PaymentStatus.REFUNDED);
        }
        bookingRepository.save(booking);        
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelSecure(String userEmail, Long bookingId, String reason) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        
        // Secure check: Ensure passengerEmail matches authenticated user's email
        if (booking.getPassengerEmail() == null || !booking.getPassengerEmail().equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Booking does not belong to the authenticated user");
        }

        // Business rule check: Verify status is currently 'CONFIRMED'
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed bookings can be cancelled");
        }

        Flight flight = booking.getFlight();
        if (flight == null) {
            throw new IllegalStateException("Flight information not found on booking");
        }

        LocalDateTime now = VietnamTime.nowLocal();
        LocalDateTime departure = flight.getDepartureAt();
        if (departure == null) {
            throw new IllegalStateException("Flight departure time is not specified");
        }

        long hoursUntilDeparture = java.time.temporal.ChronoUnit.HOURS.between(now, departure);
        if (hoursUntilDeparture < 24) {
            throw new IllegalStateException("Cancellations are only allowed at least 24 hours prior to departure");
        }

        // Fee calculation: 10% penalty for Premium Cabin, 20% otherwise
        long totalPrice = booking.getTotalPriceVnd() != null ? booking.getTotalPriceVnd() : 0L;
        long fee = flight.isPremiumCabin() ? (long)(totalPrice * 0.10) : (long)(totalPrice * 0.20);
        long refund = totalPrice - fee;

        // State mutation: Transition to REFUND_PENDING, release seat, save details
        booking.setStatus(BookingStatus.REFUND_PENDING);
        booking.setSeatNumber(null);
        booking.setCancelledAt(now);
        booking.setCancellationReason(reason != null ? reason : "Hủy trực tuyến");
        booking.setCancellationFeeVnd(fee);
        booking.setRefundAmountVnd(refund);

        PaymentTransaction payment = booking.getPaymentTransaction();
        if (payment != null && (payment.getStatus() == PaymentStatus.MOCK_CONFIRMED || payment.getStatus() == PaymentStatus.PAID)) {
            payment.setStatus(PaymentStatus.REFUNDED);
        }

        bookingRepository.save(booking);
        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<String> listOccupiedSeats(Long flightId) {
        Flight flight = flightService.getByIdOrThrow(flightId);
        return occupiedSeatsForFlight(flight).stream().toList();
    }

    private BookingResponse toResponse(Booking b) {
        Flight f = b.getFlight();
        AppUser u = b.getUser();
        return new BookingResponse(
                b.getId(),
                u.getId(),
                u.getEmail(),
                u.getFullName(),
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
                b.getCheckInChannel(),
                flightService.toResponse(f),
                b.getCancelledAt() == null ? null : VietnamTime.toInstant(b.getCancelledAt()),
                b.getCancellationReason(),
                b.getCancellationFeeVnd(),
                b.getRefundAmountVnd()
        );
    }

    private Set<String> occupiedSeatsForFlight(Flight flight) {
        Set<String> out = new LinkedHashSet<>();
        bookingRepository.findByFlightAndStatusNot(flight, BookingStatus.CANCELLED)
                .forEach(b -> {
                    if (b.getPassengers() == null || b.getPassengers().isEmpty()) {
                        out.addAll(parseSeatNumbers(b.getSeatNumber()));
                        return;
                    }
                    b.getPassengers().stream()
                            .map(BookingPassenger::getSeatNumber)
                            .filter(Objects::nonNull)
                            .map(s -> s.toUpperCase(Locale.ROOT))
                            .forEach(out::add);
                });
        return out;
    }

    private void sendCancellationEmail(Booking booking) {
        try {
            Flight flight = booking.getFlight();
            BookingDTO bookingDTO = BookingDTO.builder()
                    .bookingCode(booking.getPnr())
                    .customerName(booking.getPassengerName())
                    .customerEmail(booking.getPassengerEmail())
                    .flightCode(flight.getFlightNumber())
                    .departureCity(flight.getDepartureAirport())
                    .arrivalCity(flight.getArrivalAirport())
                    .departureTime(flight.getDepartureAt())
                    .seatNumber(booking.getSeatNumber())
                    .totalPrice(BigDecimal.valueOf(booking.getTotalPriceVnd()))
                    .build();
            emailService.sendBookingCancellationEmail(bookingDTO);
        } catch (Exception ignored) {
            // Cancellation should not roll back if email delivery is unavailable.
        }
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

    private static PaymentStatus paymentStatusFor(String paymentMethod) {
        if ("cod".equalsIgnoreCase(paymentMethod)) {
            return PaymentStatus.MOCK_CONFIRMED;
        }
        return PaymentStatus.PENDING;
    }

    private static String paymentProvider(String paymentMethod) {
        String cleaned = clean(paymentMethod);
        return cleaned == null ? "UNSPECIFIED" : cleaned.toUpperCase(Locale.ROOT);
    }
}