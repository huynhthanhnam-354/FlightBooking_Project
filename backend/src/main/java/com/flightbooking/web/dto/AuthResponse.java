package com.flightbooking.web.dto;

public record AuthResponse(
        String token,
        String tokenType,
        String email,
        String fullName,
        String role,
        String phone,
        boolean shareAnalytics,
        boolean marketingOptIn
) {
    public static AuthResponse of(
            String token,
            String email,
            String fullName,
            String role,
            String phone,
            boolean shareAnalytics,
            boolean marketingOptIn
    ) {
        return new AuthResponse(token, "Bearer", email, fullName, role, phone, shareAnalytics, marketingOptIn);
    }
}
