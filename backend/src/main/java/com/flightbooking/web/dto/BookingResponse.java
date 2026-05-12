package com.flightbooking.web.dto;

import com.flightbooking.model.BookingStatus;

import java.time.Instant;

public record BookingResponse(
        Long id,
        String pnr,
        BookingStatus status,
        String seatNumber,
        String passengerName,
        long totalPriceVnd,
        Instant createdAt,
        FlightResponse flight
) {
}
