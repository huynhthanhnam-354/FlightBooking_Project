package com.flightbooking.web.dto;

import java.util.List;

public record SupportWorkflowResponse(
        String decision,
        String bookingStatus,
        String reason,
        List<String> steps,
        String customerAction,
        String suggestedReply
) {
}
