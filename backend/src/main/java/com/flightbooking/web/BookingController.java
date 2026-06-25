package com.flightbooking.web;

import com.flightbooking.service.BookingService;
import com.flightbooking.service.SeatHoldService;
import com.flightbooking.web.dto.BaggageUpdateRequest;
import com.flightbooking.web.dto.BookingResponse;
import com.flightbooking.web.dto.CheckInRequest;
import com.flightbooking.web.dto.CreateBookingRequest;
import com.flightbooking.web.dto.SeatHoldRequest;
import com.flightbooking.web.dto.SeatHoldResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BookingController {

    private final BookingService bookingService;
    private final SeatHoldService seatHoldService;

    @GetMapping("/me")
    public List<BookingResponse> myBookings(@AuthenticationPrincipal UserDetails user) {
        return bookingService.listMine(user.getUsername());
    }

    @GetMapping("/{id}/time-remaining")
    public java.util.Map<String, Long> getTimeRemaining(@PathVariable Long id) {
        return bookingService.getTimeRemaining(id);
    }

    @GetMapping("/occupied-seats")
    public List<String> occupiedSeats(@RequestParam Long flightId) {
        return bookingService.listOccupiedSeats(flightId);
    }

    @PostMapping("/seat-holds")
    public SeatHoldResponse holdSeat(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody SeatHoldRequest request
    ) {
        return seatHoldService.hold(user.getUsername(), request.flightId(), request.seatNumber());
    }

    @PostMapping("/seat-holds/release")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void releaseSeat(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody SeatHoldRequest request
    ) {
        seatHoldService.release(user.getUsername(), request.flightId(), request.seatNumber());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody CreateBookingRequest request
    ) {
        return bookingService.create(user.getUsername(), request);
    }

    @PutMapping("/{bookingId}/baggage")
    public BookingResponse updateBaggage(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long bookingId,
            @Valid @RequestBody BaggageUpdateRequest request
    ) {
        return bookingService.updateBaggage(user.getUsername(), bookingId, request);
    }

    @PostMapping("/check-in")
    public BookingResponse checkIn(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody CheckInRequest request
    ) {
        return bookingService.checkIn(user.getUsername(), request);
    }

    @PostMapping("/{bookingId}/payment/mock-confirm")
    public BookingResponse confirmMockPayment(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long bookingId
    ) {
        String username = (user != null) ? user.getUsername() : null;
        if (username == null) {
            // Cơ chế fallback tìm email theo id đơn hàng để phục vụ luồng mock public
            username = bookingService.listAllForAdmin().stream()
                    .filter(b -> b.id().equals(bookingId))
                    .map(BookingResponse::passengerEmail)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Không thể xác định thông tin tài khoản người dùng."));
        }
        return bookingService.confirmMockPayment(username, bookingId);
    }

    @PostMapping("/payment-success")
    public BookingResponse paymentSuccess(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam java.util.Map<String, String> allParams,
            @RequestBody(required = false) java.util.Map<String, String> bodyParams
    ) {
        java.util.Map<String, String> params = new java.util.HashMap<>();
        if (allParams != null) {
            params.putAll(allParams);
        }
        if (bodyParams != null) {
            params.putAll(bodyParams);
        }

        Long id = null;
        String bookingIdStr = params.get("bookingId");
        if (bookingIdStr != null && !bookingIdStr.isBlank()) {
            try {
                id = Long.valueOf(bookingIdStr);
            } catch (NumberFormatException ignored) {}
        }

        String username = (user != null) ? user.getUsername() : null;
        if (username == null && id != null) {
            final Long targetId = id;
            username = bookingService.listAllForAdmin().stream()
                    .filter(b -> b.id().equals(targetId))
                    .map(BookingResponse::passengerEmail)
                    .findFirst()
                    .orElse(null);
        }
        if (username == null) {
            throw new IllegalArgumentException("Không thể xác định thông tin tài khoản người dùng.");
        }

        // Tự động phân luồng: Nếu không có chữ ký vnp_SecureHash, đây là luồng thanh toán QR giả lập!
        String vnp_SecureHash = params.get("vnp_SecureHash");
        if (vnp_SecureHash == null || vnp_SecureHash.isBlank()) {
            if (id == null) {
                throw new IllegalArgumentException("Booking ID is required for mock payment confirmation");
            }
            return bookingService.confirmMockPayment(username, id);
        }

        return bookingService.confirmPaymentVnPay(username, id, params);
    }

    @PostMapping("/{bookingId}/cancel")
    public BookingResponse cancel(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long bookingId
    ) {
        return bookingService.cancel(user.getUsername(), bookingId);
    }

    @PutMapping("/{bookingId}/cancel")
    public BookingResponse cancelPut(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long bookingId,
            @RequestBody(required = false) java.util.Map<String, String> payload
    ) {
        String reason = payload != null ? payload.get("reason") : "Hủy trực tuyến";
        return bookingService.cancelSecure(user.getUsername(), bookingId, reason);
    }
}