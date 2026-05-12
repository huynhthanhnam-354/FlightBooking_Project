package com.flightbooking.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateBookingRequest(
        @NotNull @Positive Long flightId,
        @NotBlank @Size(max = 8) String seatNumber,
        @NotBlank @Size(max = 200) String passengerName,
        @Email @Size(max = 190) String passengerEmail,
        @Size(max = 32) String passengerPhone,
        @NotNull @Positive Long totalPriceVnd
) {
}
