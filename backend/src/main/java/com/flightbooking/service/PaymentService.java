package com.flightbooking.service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

public interface PaymentService {
    String createVnPayPaymentUrl(Long bookingId, HttpServletRequest request);
    Map<String, String> processVnPayIpn(Map<String, String> params);
}
