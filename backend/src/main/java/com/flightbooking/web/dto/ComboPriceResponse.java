package com.flightbooking.web.dto;

public record ComboPriceResponse(
        Long comboId,
        Long selectedFlightId,
        String selectedRoomTypeId,
        Long totalPriceVnd,
        Long basePriceVnd,
        Long flightDiffVnd,
        Long roomDiffVnd
) {
}
