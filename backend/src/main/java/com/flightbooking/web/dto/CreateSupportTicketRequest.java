package com.flightbooking.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSupportTicketRequest(
        @NotBlank @Size(max = 48) String category,
        @Size(max = 24) String pnr,
        @NotBlank @Size(max = 1200) String message
) {
}
