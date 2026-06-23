package com.flightbooking.web.dto;

import jakarta.validation.constraints.NotNull;

public record ComboPriceRequest(
        @NotNull(message = "Combo ID is required") Long comboId,
        Long selectedFlightId,
        String selectedRoomTypeId
) {
}
