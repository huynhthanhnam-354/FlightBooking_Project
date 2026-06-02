package com.flightbooking.web.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        String email,
        String fullName,
        String role,
        String phone,
        boolean shareAnalytics,
        boolean marketingOptIn
) {
    public static AuthResponse of(
            String accessToken,
            String refreshToken,
            String email,
            String fullName,
            String role,
            String phone,
            boolean shareAnalytics,
            boolean marketingOptIn
    ) {
        return new AuthResponse(accessToken, refreshToken, "Bearer", email, fullName, role, phone, shareAnalytics, marketingOptIn);
    }
}
