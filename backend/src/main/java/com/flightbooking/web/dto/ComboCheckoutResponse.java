package com.flightbooking.web.dto;

public record ComboCheckoutResponse(
        String paymentUrl,
        Long bookingId,
        String pnr
) {
}
