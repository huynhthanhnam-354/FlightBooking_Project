package com.flightbooking.service;

import com.flightbooking.model.Booking;
import com.flightbooking.model.PaymentHistory;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.repository.PaymentHistoryRepository;
import com.flightbooking.time.VietnamTime;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VnpayService {

    private static final Logger log = LoggerFactory.getLogger(VnpayService.class);

    private final BookingRepository bookingRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;

    @Value("${app.vnpay.tmn-code:F4JOX2UY}")
    private String vnp_TmnCode;

    @Value("${app.vnpay.hash-secret:AQODJSRVZZTRNMTIKGOWVPHFXXKJZIEW}")
    private String vnp_HashSecret;

    @Value("${app.vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnp_PayUrl;

    @Value("${app.vnpay.return-url:http://localhost:8081/api/payments/vnpay-return}")
    private String vnp_ReturnUrl;

    @Transactional(readOnly = true)
    public String createPaymentUrl(Long bookingId, String ipAddress) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn đặt vé với ID: " + bookingId));

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = "Thanh toan ve may bay. PNR: " + booking.getPnr();
        String vnp_OrderType = "other";
        String vnp_TxnRef = booking.getPnr();
        String vnp_IpAddr = (ipAddress != null && !ipAddress.isBlank()) ? ipAddress : "127.0.0.1";
        String vnp_Locale = "vn";
        String vnp_CurrCode = "VND";

        long amount = booking.getTotalPriceVnd() * 100L;

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String vnp_CreateDate = now.format(formatter);
        String vnp_ExpireDate = now.plusMinutes(15).format(formatter); // Hết hạn thanh toán sau 15 phút

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

        List<String> hashParams = new ArrayList<>();
        List<String> queryParams = new ArrayList<>();

        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                try {
                    String encodedFieldValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString());
                    
                    // VNPAY v2.1.0 expects URL-encoded values in both hashData and queryUrl
                    hashParams.add(fieldName + "=" + encodedFieldValue);
                    queryParams.add(fieldName + "=" + encodedFieldValue);
                } catch (Exception e) {
                    log.error("URL Encoding error: ", e);
                }
            }
        }

        String hashData = String.join("&", hashParams);
        String queryUrl = String.join("&", queryParams);
        String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData);

        String finalUrl = vnp_PayUrl + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;

        log.info("--- VNPAY URL Generation Debug ---");
        log.info("hashData trước khi ký: {}", hashData);
        log.info("secureHash sau khi ký: {}", vnp_SecureHash);
        log.info("URL cuối cùng gửi sang VNPAY: {}", finalUrl);
        log.info("----------------------------------");

        return finalUrl;
    }

    public boolean verifySignature(Map<String, String> allParams) {
        String vnp_SecureHash = allParams.get("vnp_SecureHash");
        if (vnp_SecureHash == null || vnp_SecureHash.isBlank()) {
            return false;
        }

        List<String> fieldNames = allParams.keySet().stream()
                .filter(k -> k.startsWith("vnp_") && !k.equals("vnp_SecureHash") && !k.equals("vnp_SecureHashType"))
                .sorted()
                .collect(Collectors.toList());

        List<String> pairs = new ArrayList<>();
        for (String fieldName : fieldNames) {
            String fieldValue = allParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                try {
                    pairs.add(fieldName + "=" + URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                } catch (Exception e) {
                    log.error("URL Encoding error in verifySignature: ", e);
                }
            }
        }
        String hashData = String.join("&", pairs);
        String calculatedHash = hmacSHA512(vnp_HashSecret, hashData);

        log.info("--- VNPAY Signature Verification Debug ---");
        log.info("Incoming secureHash: {}", vnp_SecureHash);
        log.info("Calculated secureHash: {}", calculatedHash);
        log.info("hashData used for verify: {}", hashData);
        log.info("------------------------------------------");

        return calculatedHash.equalsIgnoreCase(vnp_SecureHash);
    }

    @Transactional
    public PaymentHistory savePaymentHistory(Map<String, String> allParams, String status) {
        String pnr = allParams.get("vnp_TxnRef");
        Booking booking = null;
        if (pnr != null && !pnr.isBlank()) {
            booking = bookingRepository.findByPnrIgnoreCase(pnr).orElse(null);
        }

        Long amount = null;
        String amountStr = allParams.get("vnp_Amount");
        if (amountStr != null) {
            try {
                amount = Long.parseLong(amountStr) / 100L;
            } catch (NumberFormatException ignored) {}
        }

        PaymentHistory history = PaymentHistory.builder()
                .booking(booking)
                .pnr(pnr)
                .amountVnd(amount)
                .vnpTxnRef(pnr)
                .vnpTransactionNo(allParams.get("vnp_TransactionNo"))
                .vnpResponseCode(allParams.get("vnp_ResponseCode"))
                .vnpTransactionStatus(allParams.get("vnp_TransactionStatus"))
                .vnpBankCode(allParams.get("vnp_BankCode"))
                .vnpCardType(allParams.get("vnp_CardType"))
                .vnpPayDate(allParams.get("vnp_PayDate"))
                .vnpSecureHash(allParams.get("vnp_SecureHash"))
                .status(status)
                .build();

        return paymentHistoryRepository.save(history);
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
            log.error("HMAC-SHA512 hash computation failed: ", ex);
            return "";
        }
    }
}
