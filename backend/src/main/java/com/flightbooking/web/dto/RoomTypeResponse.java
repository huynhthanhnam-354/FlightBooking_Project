package com.flightbooking.web.dto;

public record RoomTypeResponse(
        String id,
        String name,
        Long priceDiff
) {
}
