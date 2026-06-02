package com.flightbooking.web;

import com.flightbooking.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/vnpay")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-url")
    public ResponseEntity<Map<String, String>> createUrl(@RequestParam Long bookingId, HttpServletRequest request) {
        String url = paymentService.createVnPayPaymentUrl(bookingId, request);
        return ResponseEntity.ok(Map.of("paymentUrl", url));
    }

    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> receiveIpn(@RequestParam Map<String, String> allParams) {
        Map<String, String> response = paymentService.processVnPayIpn(allParams);
        return ResponseEntity.ok(response);
    }
}
