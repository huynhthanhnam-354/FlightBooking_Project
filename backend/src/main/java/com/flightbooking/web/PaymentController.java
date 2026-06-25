package com.flightbooking.web;

import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.service.BookingService;
import com.flightbooking.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final VnpayService vnpayService;
    private final BookingService bookingService;
    private final BookingRepository bookingRepository;

    @Value("${app.vnpay.frontend-url:http://localhost:5173/user-dashboard}")
    private String frontendUrl;

    @PostMapping("/create-payment")
    public ResponseEntity<Map<String, String>> createPayment(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody Map<String, Long> payload,
            HttpServletRequest request
    ) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long bookingId = payload.get("bookingId");
        if (bookingId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "bookingId is required"));
        }

        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn đặt vé"));

            // Xác thực quyền sở hữu đơn đặt vé
            if (!booking.getUser().getEmail().equalsIgnoreCase(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Bạn không có quyền thanh toán cho đơn hàng này."));
            }

            // Chỉ cho phép thanh toán khi đơn hàng đang chờ thanh toán
            if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
                return ResponseEntity.badRequest().body(Map.of("message", "Đơn hàng đã được thanh toán hoặc đã bị hủy."));
            }

            String ipAddress = request.getHeader("X-Forwarded-For");
            if (ipAddress == null || ipAddress.isBlank()) {
                ipAddress = request.getRemoteAddr();
            }

            String paymentUrl = vnpayService.createPaymentUrl(bookingId, ipAddress);
            return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi khi khởi tạo thanh toán VNPAY: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Lỗi máy chủ khi tạo giao dịch thanh toán."));
        }
    }

    @GetMapping("/vnpay-return")
    public void vnpayReturn(
            @RequestParam Map<String, String> allParams,
            HttpServletResponse response
    ) throws IOException {
        log.info("VNPAY Return Callback Params: {}", allParams);

        String pnr = allParams.get("vnp_TxnRef");
        String responseCode = allParams.get("vnp_ResponseCode");

        // 1. Kiểm tra chữ ký số bảo mật
        if (!vnpayService.verifySignature(allParams)) {
            log.error("VNPAY Return Signature check failed for PNR: {}", pnr);
            vnpayService.savePaymentHistory(allParams, "SIGNATURE_FAILED");
            response.sendRedirect(frontendUrl + "?paymentStatus=failed");
            return;
        }

        // 2. Kiểm tra mã phản hồi (00 = Thành công)
        if (!"00".equals(responseCode)) {
            log.warn("VNPAY Return Payment failed with ResponseCode: {} for PNR: {}", responseCode, pnr);
            vnpayService.savePaymentHistory(allParams, "FAILED");
            response.sendRedirect(frontendUrl + "?paymentStatus=failed");
            return;
        }

        try {
            // Lấy email chủ đơn hàng để xác nhận giao dịch bằng BookingService
            String email = bookingService.getEmailForBooking(null, pnr);
            if (email == null) {
                log.error("VNPAY Return: Order owner email not found for PNR: {}", pnr);
                vnpayService.savePaymentHistory(allParams, "USER_NOT_FOUND");
                response.sendRedirect(frontendUrl + "?paymentStatus=failed");
                return;
            }

            // Cập nhật trạng thái Booking và PaymentTransaction
            bookingService.confirmPaymentVnPay(email, null, allParams);

            // Lưu lịch sử thanh toán thành công
            vnpayService.savePaymentHistory(allParams, "SUCCESS");

            response.sendRedirect(frontendUrl + "?paymentStatus=success");
        } catch (Exception e) {
            log.error("VNPAY Return: Error confirming payment for PNR: " + pnr, e);
            vnpayService.savePaymentHistory(allParams, "ERROR_CONFIRMING");
            response.sendRedirect(frontendUrl + "?paymentStatus=failed");
        }
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(@RequestParam Map<String, String> allParams) {
        log.info("VNPAY IPN Callback Params: {}", allParams);
        Map<String, String> result = new HashMap<>();

        try {
            // 1. Kiểm tra chữ ký bảo mật
            if (!vnpayService.verifySignature(allParams)) {
                log.error("VNPAY IPN Signature check failed");
                vnpayService.savePaymentHistory(allParams, "IPN_SIGNATURE_FAILED");
                result.put("RspCode", "97");
                result.put("Message", "Invalid Checksum");
                return ResponseEntity.ok(result);
            }

            String pnr = allParams.get("vnp_TxnRef");
            Booking booking = bookingRepository.findByPnrIgnoreCase(pnr).orElse(null);

            // 2. Kiểm tra xem đơn hàng (PNR) có tồn tại trong hệ thống không
            if (booking == null) {
                log.warn("VNPAY IPN: Order not found for PNR: {}", pnr);
                vnpayService.savePaymentHistory(allParams, "IPN_ORDER_NOT_FOUND");
                result.put("RspCode", "01");
                result.put("Message", "Order not found");
                return ResponseEntity.ok(result);
            }

            // 3. Kiểm tra số tiền giao dịch có khớp không (VNPAY Amount = VND * 100)
            Long vnpAmount = Long.parseLong(allParams.get("vnp_Amount")) / 100L;
            if (!vnpAmount.equals(booking.getTotalPriceVnd())) {
                log.warn("VNPAY IPN: Invalid amount. Expect: {}, Actual: {}", booking.getTotalPriceVnd(), vnpAmount);
                vnpayService.savePaymentHistory(allParams, "IPN_INVALID_AMOUNT");
                result.put("RspCode", "04");
                result.put("Message", "Invalid Amount");
                return ResponseEntity.ok(result);
            }

            // 4. Kiểm tra xem đơn hàng đã được cập nhật trạng thái trước đó chưa
            if (booking.getStatus() == BookingStatus.CONFIRMED) {
                log.info("VNPAY IPN: Order already confirmed for PNR: {}", pnr);
                result.put("RspCode", "02");
                result.put("Message", "Order already confirmed");
                return ResponseEntity.ok(result);
            }

            // 5. Kiểm tra kết quả giao dịch và thực hiện cập nhật
            String responseCode = allParams.get("vnp_ResponseCode");
            if ("00".equals(responseCode)) {
                String email = booking.getUser().getEmail();
                bookingService.confirmPaymentVnPay(email, booking.getId(), allParams);
                vnpayService.savePaymentHistory(allParams, "SUCCESS");
                log.info("VNPAY IPN: Confirm Success for PNR: {}", pnr);
            } else {
                vnpayService.savePaymentHistory(allParams, "FAILED");
                log.warn("VNPAY IPN: Payment failed with ResponseCode: {} for PNR: {}", responseCode, pnr);
            }

            result.put("RspCode", "00");
            result.put("Message", "Confirm Success");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("VNPAY IPN: Internal server error", e);
            result.put("RspCode", "99");
            result.put("Message", "Unknown error");
            return ResponseEntity.ok(result);
        }
    }
}
