package com.flightbooking.web.dto;

import java.time.Instant;

public record SeatHoldResponse(
        Long flightId,
        String seatNumber,
        boolean held,
        Instant expiresAt,
        long remainingSeconds
) {
}
