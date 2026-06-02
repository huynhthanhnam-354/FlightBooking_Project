package com.flightbooking.service;

import com.flightbooking.config.VNPAYConfig;
import com.flightbooking.dto.BookingDTO;
import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.model.Flight;
import com.flightbooking.repository.BookingRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final BookingRepository bookingRepository;
    private final VNPAYConfig vnpayConfig;
    private final EmailService emailService;
    private final QRCodeService qrCodeService;

    @Override
    @Transactional
    public String createVnPayPaymentUrl(Long bookingId, HttpServletRequest request) {
        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Trạng thái đơn hàng không hợp lệ để thanh toán");
        }

        String vnp_TxnRef = booking.getPnr();
        long amount = booking.getTotalPriceVnd() * 100;

        Map<String, String> vnp_Params = new TreeMap<>();
        vnp_Params.put("vnp_Version", vnpayConfig.getVnp_Version());
        vnp_Params.put("vnp_Command", vnpayConfig.getVnp_Command());
        vnp_Params.put("vnp_TmnCode", vnpayConfig.getVnp_TmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan ve may bay " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnpayConfig.getVnp_ReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnpayConfig.getIpAddress(request));

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<Map.Entry<String, String>> itr = vnp_Params.entrySet().iterator();
        while (itr.hasNext()) {
            Map.Entry<String, String> entry = itr.next();
            String fieldName = entry.getKey();
            String fieldValue = entry.getValue();
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = vnpayConfig.hmacSHA512(vnpayConfig.getVnp_HashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return vnpayConfig.getVnp_PayUrl() + "?" + queryUrl;
    }

    @Override
    @Transactional
    public Map<String, String> processVnPayIpn(Map<String, String> params) {
        log.info("Processing VNPAY IPN with params: {}", params);
        
        String vnp_SecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHashType");
        params.remove("vnp_SecureHash");

        // Sort params for hashing
        Map<String, String> sortedParams = new TreeMap<>(params);
        StringBuilder hashData = new StringBuilder();
        Iterator<Map.Entry<String, String>> itr = sortedParams.entrySet().iterator();
        while (itr.hasNext()) {
            Map.Entry<String, String> entry = itr.next();
            String fieldName = entry.getKey();
            String fieldValue = entry.getValue();
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String sign = vnpayConfig.hmacSHA512(vnpayConfig.getVnp_HashSecret(), hashData.toString());
        if (!sign.equalsIgnoreCase(vnp_SecureHash)) {
            return Map.of("RspCode", "97", "Message", "Invalid signature");
        }

        String pnr = params.get("vnp_TxnRef");
        Booking booking = bookingRepository.findByPnrForUpdate(pnr).orElse(null);

        if (booking == null) {
            return Map.of("RspCode", "01", "Message", "Order not found");
        }

        long vnpAmount = Long.parseLong(params.get("vnp_Amount")) / 100;
        if (booking.getTotalPriceVnd() != vnpAmount) {
            return Map.of("RspCode", "04", "Message", "Invalid amount");
        }

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            return Map.of("RspCode", "02", "Message", "Order already confirmed");
        }

        String responseCode = params.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            booking.setStatus(BookingStatus.CONFIRMED);
            log.info("Booking {} marked as CONFIRMED via VNPAY IPN", pnr);
            
            // Tích hợp gửi email xác nhận và QR Code
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
                        .basePrice(BigDecimal.valueOf(flight.getBasePriceVnd()))
                        .taxAmount(BigDecimal.valueOf(booking.getTotalPriceVnd() - flight.getBasePriceVnd()))
                        .totalPrice(BigDecimal.valueOf(booking.getTotalPriceVnd()))
                        .build();

                String qrCode = qrCodeService.generateQRCodeBase64(booking.getPnr(), 300, 300);
                emailService.sendBookingSuccessEmail(bookingDTO, qrCode);
            } catch (Exception e) {
                log.error("Lỗi khi chuẩn bị dữ liệu gửi email: {}", e.getMessage());
            }
        } else {
            booking.setStatus(BookingStatus.CANCELLED);
            log.info("Booking {} marked as CANCELLED via VNPAY IPN (ResponseCode: {})", pnr, responseCode);
        }
        
        bookingRepository.save(booking);
        return Map.of("RspCode", "00", "Message", "Confirm success");
    }
}
