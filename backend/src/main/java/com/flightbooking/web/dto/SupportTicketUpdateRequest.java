package com.flightbooking.web.dto;

import com.flightbooking.model.SupportTicketStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SupportTicketUpdateRequest(
        @NotNull SupportTicketStatus status,
        @Size(max = 1200) String adminReply
) {
}
