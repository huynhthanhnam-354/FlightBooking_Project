package com.flightbooking.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank @Size(max = 200) String fullName,
        @Size(max = 32) String phone
) {
}
