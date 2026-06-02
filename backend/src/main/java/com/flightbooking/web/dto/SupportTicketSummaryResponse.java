package com.flightbooking.web.dto;

import java.util.Map;

public record SupportTicketSummaryResponse(
        long total,
        long open,
        long inProgress,
        long resolved,
        long closed,
        Map<String, Long> byStatus
) {
}
