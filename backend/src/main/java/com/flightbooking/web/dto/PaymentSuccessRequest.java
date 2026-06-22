package com.flightbooking.web.dto;

import jakarta.validation.constraints.NotNull;

public record PaymentSuccessRequest(
        @NotNull Long bookingId
) {
}
