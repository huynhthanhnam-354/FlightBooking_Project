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
import com.flightbooking.repository.FlightSeatRepository;
import com.flightbooking.repository.SeatHoldRepository;
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
import java.util.stream.Collectors;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;



@Service
@RequiredArgsConstructor
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);
    private static final List<BookingStatus> PAID_REVENUE_STATUSES = List.of(
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
            BookingStatus.COMPLETED
    );

    private final BookingRepository bookingRepository;
    private final AppUserRepository appUserRepository;
    private final FlightRepository flightRepository;
    private final FlightService flightService;
    private final EmailService emailService;
    private final PnrGenerator pnrGenerator;
    private final SeatHoldRepository seatHoldRepository;
    private final FlightSeatRepository flightSeatRepository;

    @Value("${app.vnpay.tmn-code:2QXUI8KI}")
    private String vnp_TmnCode;

    @Value("${app.vnpay.hash-secret:AQODJSRVZZTRNMTIKGOWVPHFXXKJZIEW}")
    private String vnp_HashSecret;

    @Value("${app.vnpay.url:http://localhost:8081/api/v1/payments/vnpay-mock}")
    private String vnp_PayUrl;

    @Value("${app.vnpay.return-url:http://localhost:5173/checkout/success}")
    private String vnp_ReturnUrl;

    /**
              * VÁ LỖI 1: Hàm checkSeatAvailability bị thiếu khiến Controller báo lỗi biên dịch
              */
    @Transactional(readOnly = true)
    public boolean checkSeatAvailability(Long flightId, List<String> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) {
            return true;
        }
        List<BookingStatus> activeStatuses = Arrays.asList(
                BookingStatus.PENDING_PAYMENT,
                BookingStatus.CONFIRMED,
                BookingStatus.CHECKED_IN,
                BookingStatus.COMPLETED
        );
        for (String seat : seatIds) {
            boolean exists = bookingRepository.existsByFlightIdAndSeatNumberAndStatusIn(
                    flightId,
                    seat.toUpperCase(Locale.ROOT),
                    activeStatuses
            );
            if (exists) {
                return false; // Đã có ít nhất 1 ghế bị đặt trước trên chuyến bay này
            }
        }
        return true;
    }

    @Transactional(readOnly = true)
    public boolean checkSeatAvailability(List<String> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) {
            return true;
        }
        // Fallback check globally using DB stream (deprecated - use flightId version instead)
        for (String seat : seatIds) {
            long count = bookingRepository.findAll().stream()
                    .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                    .filter(b -> parseSeatNumbers(b.getSeatNumber()).contains(seat.toUpperCase(Locale.ROOT)))
                    .count();
            if (count > 0) {
                return false;
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
                .orElseThrow(() -> new IllegalArgumentException("Failed to retrieve created booking"));
    }

    @Transactional
    public BookingResponse create(String userEmail, CreateBookingRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        Flight flight = flightRepository.findById(request.flightId())
                .orElseThrow(() -> new IllegalArgumentException("Flight not found: " + request.flightId()));
        String seatNumber = normalizeSeatNumbers(request.seatNumber());
        String passengerName = InputValidator.requirePersonName(request.passengerName());
        String passengerEmail = request.passengerEmail() == null || request.passengerEmail().isBlank()
                ? null
                : InputValidator.requireEmail(request.passengerEmail());
        if (passengerEmail == null) {
            passengerEmail = user.getEmail();
        }
        if (!passengerEmail.equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Email nhận vé phải trùng với email tài khoản đang đăng nhập.");
        }
        String passengerPhone = InputValidator.optionalPhone(request.passengerPhone());
        String passengerIdCard = InputValidator.optionalIdCard(request.passengerIdCard());

        //
        for (String seat : parseSeatNumbers(seatNumber)) {
            lockAndCheckSeat(flight, seat);
        }

        for (String seat : parseSeatNumbers(seatNumber)) {
            seatHoldRepository.findByFlightAndSeatNumberAndExpiresAtAfter(flight, seat, VietnamTime.nowLocal())
                    .ifPresent(hold -> {
                        if (!hold.getUser().getId().equals(user.getId())) {
                            throw new IllegalStateException("Seat is being held by another user. Please choose another seat.");
                        }
                    });
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

        // Mark locked FlightSeat records as booked
        for (String seat : parseSeatNumbers(seatNumber)) {
            flightSeatRepository.findByFlightIdAndSeatNumberForUpdate(flight.getId(), seat.toUpperCase(Locale.ROOT))
                    .ifPresent(fs -> {
                        fs.setBooked(true);
                        flightSeatRepository.save(fs);
                    });
        }

        seatHoldRepository.deleteByFlightAndUserAndSeatNumberIn(flight, user, parseSeatNumbers(seatNumber));
        return toResponse(booking);
    }

    private void lockAndCheckSeat(Flight flight, String seat) {
        String normalizedSeat = seat.trim().toUpperCase(Locale.ROOT);
        com.flightbooking.model.FlightSeat flightSeat = flightSeatRepository.findByFlightIdAndSeatNumberForUpdate(flight.getId(), normalizedSeat)
                .orElse(null);
        if (flightSeat == null) {
            flightSeat = com.flightbooking.model.FlightSeat.builder()
                    .flight(flight)
                    .seatNumber(normalizedSeat)
                    .isBooked(false)
                    .build();
            try {
                flightSeat = flightSeatRepository.saveAndFlush(flightSeat);
            } catch (Exception e) {
                flightSeat = flightSeatRepository.findByFlightIdAndSeatNumberForUpdate(flight.getId(), normalizedSeat)
                        .orElseThrow(() -> new IllegalStateException("Không thể giữ ghế " + normalizedSeat + " do tranh chấp hệ thống."));
            }
        }
        if (flightSeat.isBooked()) {
            throw new IllegalStateException("Ghế " + normalizedSeat + " đã được người khác đặt trước. Vui lòng chọn ghế khác.");
        }
    }

    private void releaseSeat(Flight flight, String seatNumber) {
        if (seatNumber == null || seatNumber.isBlank()) return;
        for (String seat : parseSeatNumbers(seatNumber)) {
            flightSeatRepository.findByFlightAndSeatNumber(flight, seat.toUpperCase(Locale.ROOT))
                    .ifPresent(fs -> {
                        fs.setBooked(false);
                        flightSeatRepository.save(fs);
                    });
        }
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listMine(String userEmail) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        return bookingRepository.findMineOrderByCreatedAtDesc(user, user.getEmail()).stream()
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
        long expired = bookingRepository.countByStatus(BookingStatus.EXPIRED);
        long refundPending = bookingRepository.countByStatus(BookingStatus.REFUND_PENDING);
        List<Booking> bookings = bookingRepository.findAll();
        long onlineCheckedIn = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_IN)
                .filter(b -> "ONLINE".equalsIgnoreCase(b.getCheckInChannel()))
                .count();
        long revenue = bookings.stream()
                .filter(b -> PAID_REVENUE_STATUSES.contains(b.getStatus()))
                .mapToLong(b -> b.getTotalPriceVnd() == null ? 0L : b.getTotalPriceVnd())
                .sum();
        long baggageRevenue = bookings.stream()
                .filter(b -> PAID_REVENUE_STATUSES.contains(b.getStatus()))
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
                        "CANCELLED", cancelled,
                        "EXPIRED", expired,
                        "REFUND_PENDING", refundPending
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
    public BookingResponse confirmPaymentVnPay(String userEmail, Long bookingId, Map<String, String> allParams) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        
        Booking booking;
        if (bookingId != null) {
            booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng đặt vé"));
        } else {
            String pnr = allParams.get("vnp_TxnRef");
            if (pnr == null || pnr.isBlank()) {
                throw new IllegalArgumentException("Không tìm thấy thông tin mã đặt vé (PNR) để xác nhận thanh toán.");
            }
            booking = bookingRepository.findByPnrIgnoreCase(pnr)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng đặt vé với mã PNR: " + pnr));
        }

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Đơn hàng không thuộc về tài khoản này");
        }

        // 1. Kiểm tra chữ ký bảo mật VNPay
        String vnp_SecureHash = allParams.get("vnp_SecureHash");
        if (vnp_SecureHash == null || vnp_SecureHash.isBlank()) {
            throw new IllegalArgumentException("Thiếu chữ ký bảo mật vnp_SecureHash từ VNPay");
        }

        List<String> fieldNames = allParams.keySet().stream()
                .filter(k -> k.startsWith("vnp_") && !k.equals("vnp_SecureHash") && !k.equals("vnp_SecureHashType"))
                .sorted()
                .collect(Collectors.toList());

        List<String> pairs = new ArrayList<>();
        for (String fieldName : fieldNames) {
            String fieldValue = allParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                pairs.add(fieldName + "=" + fieldValue);
            }
        }
        String hashData = String.join("&", pairs);
        String calculatedHash = hmacSHA512(vnp_HashSecret, hashData);

        if (!calculatedHash.equalsIgnoreCase(vnp_SecureHash)) {
            throw new IllegalArgumentException("Xác thực giao dịch không thành công: Chữ ký bảo mật không khớp (Giả mạo giao dịch).");
        }

        // 2. Kiểm tra mã kết quả giao dịch từ VNPay (vnp_ResponseCode = 00 nghĩa là thành công)
        String responseCode = allParams.get("vnp_ResponseCode");
        if (!"00".equals(responseCode)) {
            throw new IllegalStateException("Thanh toán thất bại từ nhà cung cấp VNPay, mã phản hồi: " + responseCode);
        }

        // 3. Tiến hành cập nhật trạng thái đặt vé
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return toResponse(booking);
        }
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new IllegalArgumentException("Đơn hàng không ở trạng thái chờ thanh toán");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        PaymentTransaction payment = booking.getPaymentTransaction();
        if (payment != null) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(VietnamTime.nowLocal());
            payment.setProviderReference(allParams.getOrDefault("vnp_TransactionNo", booking.getPnr()));
        }
        bookingRepository.save(booking);
        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public String getEmailForBooking(Long bookingId, String pnr) {
        Booking booking = null;
        if (bookingId != null) {
            booking = bookingRepository.findById(bookingId).orElse(null);
        } else if (pnr != null && !pnr.isBlank()) {
            booking = bookingRepository.findByPnrIgnoreCase(pnr).orElse(null);
        }
        return booking != null && booking.getUser() != null ? booking.getUser().getEmail() : null;
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
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return toResponse(booking);
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
        
        releaseSeat(booking.getFlight(), booking.getSeatNumber());
        
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
        
        releaseSeat(flight, booking.getSeatNumber());
        
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
        Set<String> out = new LinkedHashSet<>(occupiedSeatsForFlight(flight));
        seatHoldRepository.findByFlightAndExpiresAtAfter(flight, VietnamTime.nowLocal()).stream()
                .map(hold -> hold.getSeatNumber().toUpperCase(Locale.ROOT))
                .forEach(out::add);
        return out.stream().toList();
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
                b.getExpiresAt() == null ? null : VietnamTime.toInstant(b.getExpiresAt()),
                b.getCheckedInAt() == null ? null : VietnamTime.toInstant(b.getCheckedInAt()),
                b.getCheckInChannel(),
                flightService.toResponse(f),
                b.getCancelledAt() == null ? null : VietnamTime.toInstant(b.getCancelledAt()),
                b.getCancellationReason(),
                b.getCancellationFeeVnd(),
                b.getRefundAmountVnd(),
                b.getComboId(),
                b.getSourceChannel()
        );
    }

    public Set<String> occupiedSeatsForFlight(Flight flight) {
        Set<String> out = new LinkedHashSet<>();
        bookingRepository.findByFlightAndStatusNotIn(flight, Arrays.asList(BookingStatus.CANCELLED, BookingStatus.EXPIRED, BookingStatus.REFUND_PENDING))
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

    private String generateVnPayUrl(Booking booking) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = "Thanh toan combo " + booking.getPnr();
        String vnp_OrderType = "other";
        String vnp_TxnRef = booking.getPnr();
        String vnp_IpAddr = "127.0.0.1";
        String vnp_Locale = "vn";
        String vnp_CurrCode = "VND";

        long amount = booking.getTotalPriceVnd() * 100L;

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String vnp_CreateDate = now.format(formatter);
        String vnp_ExpireDate = now.plusMinutes(10).format(formatter);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_Locale", vnp_Locale);
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                try {
                    String encodedFieldName = URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()).replace("+", "%20");
                    String encodedFieldValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()).replace("+", "%20");

                    hashData.append(encodedFieldName).append("=").append(encodedFieldValue);
                    query.append(encodedFieldName).append("=").append(encodedFieldValue);
                } catch (Exception e) {
                    log.error("URL Encoding error: ", e);
                }

                if (i < fieldNames.size() - 1) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return vnp_PayUrl + "?" + queryUrl;
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmacSHA512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmacSHA512.init(secretKey);
            byte[] result = hmacSHA512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            log.error("HMAC-SHA512 failed: ", ex);
            return "";
        }
    }

    private static String paymentProvider(String paymentMethod) {
        String cleaned = clean(paymentMethod);
        return cleaned == null ? "UNSPECIFIED" : cleaned.toUpperCase(Locale.ROOT);
    }
}
