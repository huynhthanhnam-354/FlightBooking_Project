package com.flightbooking.web.dto;

import com.flightbooking.model.BookingStatus;

import java.time.Instant;

public record BookingResponse(
        Long id,
        String pnr,
        BookingStatus status,
        String seatNumber,
        String passengerName,
        String passengerEmail,
        String passengerPhone,
        String passengerIdCard,
        int passengerCount,
        String tripType,
        String paymentMethod,
        int baggageKg,
        long baggageFeeVnd,
        long totalPriceVnd,
        Instant createdAt,
        Instant checkedInAt,
        FlightResponse flight
) {
}
