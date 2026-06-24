package com.flightbooking.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SeatHoldRequest(
        @NotNull(message = "Flight ID is required") Long flightId,
        @NotBlank(message = "Seat number is required") String seatNumber
) {
}
