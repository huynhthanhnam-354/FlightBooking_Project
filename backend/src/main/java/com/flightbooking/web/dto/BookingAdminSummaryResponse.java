package com.flightbooking.web.dto;

import java.util.Map;

public record BookingAdminSummaryResponse(
        long totalBookings,
        long pendingPayment,
        long confirmed,
        long checkedIn,
        long completed,
        long cancelled,
        long totalRevenueVnd,
        long baggageRevenueVnd,
        Map<String, Long> byStatus
) {
}
