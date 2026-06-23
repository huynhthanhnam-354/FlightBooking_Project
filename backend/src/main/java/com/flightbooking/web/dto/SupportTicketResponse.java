package com.flightbooking.web.dto;

import com.flightbooking.model.SupportTicketStatus;

import java.time.Instant;

public record SupportTicketResponse(
        Long id,
        String code,
        String userEmail,
        String userName,
        Long bookingId,
        String pnr,
        String category,
        String message,
        String adminReply,
        SupportTicketStatus status,
        Instant createdAt,
        Instant updatedAt,
        Instant resolvedAt,
        SupportWorkflowResponse workflow
) {
}
