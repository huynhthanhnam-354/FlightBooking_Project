package com.flightbooking.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ComboCheckoutRequest(
        @NotNull(message = "Combo ID is required") Long comboId,
        @NotNull(message = "Flight ID is required") Long selectedFlightId,
        @NotBlank(message = "Room Type ID is required") String selectedRoomTypeId,
        @NotBlank(message = "Passenger name is required") String passengerName,
        @NotBlank(message = "Passenger email is required") String passengerEmail,
        @NotBlank(message = "Passenger phone is required") String passengerPhone,
        @NotBlank(message = "Passenger ID card is required") String passengerIdCard,
        Integer passengerCount,
        Integer baggageKg,
        Long baggageFeeVnd
) {
}
