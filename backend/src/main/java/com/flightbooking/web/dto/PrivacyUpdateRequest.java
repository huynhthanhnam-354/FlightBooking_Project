package com.flightbooking.web.dto;

import jakarta.validation.constraints.NotNull;

public record PrivacyUpdateRequest(
        @NotNull Boolean shareAnalytics,
        @NotNull Boolean marketingOptIn
) {
}
