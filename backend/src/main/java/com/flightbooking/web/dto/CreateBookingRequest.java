package com.flightbooking.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateBookingRequest(
        @NotNull(message = "Flight ID is required") @Positive Long flightId,
        @NotBlank(message = "Seat number is required") @Size(max = 64) String seatNumber,
        @NotBlank(message = "Passenger name is required") @Size(max = 200) String passengerName,
        @Email(message = "Invalid email format") @Size(max = 190) String passengerEmail,
        @Size(max = 32) String passengerPhone,
        @Size(max = 64) String passengerIdCard,
        @NotNull(message = "Passenger count is required") @Positive @Max(9) Integer passengerCount,
        @Size(max = 24) String tripType,
        @Size(max = 32) String paymentMethod,
        @Max(40) Integer baggageKg,
        Long baggageFeeVnd,
        @NotNull(message = "Total price is required") @Positive Long totalPriceVnd
) {
}
