package com.flightbooking.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CheckInRequest(
        @NotBlank @Size(max = 24) String pnr,
        @NotBlank @Size(max = 200) String passengerLastName
) {
}
