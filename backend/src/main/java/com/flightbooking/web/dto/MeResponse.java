package com.flightbooking.web.dto;

public record MeResponse(
        String email,
        String fullName,
        String phone,
        String role,
        boolean shareAnalytics,
        boolean marketingOptIn
) {
}
