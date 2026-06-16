package com.flightbooking.web.dto;

import java.time.LocalDateTime;

public record FlightResponse(
        Long id,
        String flightNumber,
        String airline,
        String departureAirport,
        String arrivalAirport,
        LocalDateTime departureAt,
        LocalDateTime arrivalAt,
        Integer durationMinutes,
        Long price,
        boolean premiumCabin
) {
}
