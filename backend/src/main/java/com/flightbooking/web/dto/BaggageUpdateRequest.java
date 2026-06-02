package com.flightbooking.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record BaggageUpdateRequest(
        @NotNull @Min(0) @Max(40) Integer baggageKg,
        @NotNull @Min(0) Long baggageFeeVnd
) {
}
