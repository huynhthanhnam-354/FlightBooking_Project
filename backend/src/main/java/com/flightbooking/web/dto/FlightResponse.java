package com.flightbooking.web.dto;

import java.time.LocalDateTime;

public record FlightResponse(
        Long id,
        String flightNumber,
        String airlineName,
        String originCode,
        String destinationCode,
        LocalDateTime departureAt,
        LocalDateTime arrivalAt,
        int durationMinutes,
        long basePriceVnd,
        boolean premiumCabin
) {
}
