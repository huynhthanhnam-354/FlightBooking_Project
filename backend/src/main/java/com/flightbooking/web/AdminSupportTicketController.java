package com.flightbooking.web;

import com.flightbooking.service.SupportTicketService;
import com.flightbooking.web.dto.SupportTicketResponse;
import com.flightbooking.web.dto.SupportTicketSummaryResponse;
import com.flightbooking.web.dto.SupportTicketUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/support-tickets")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSupportTicketController {

    private final SupportTicketService supportTicketService;

    @GetMapping
    public List<SupportTicketResponse> allTickets() {
        return supportTicketService.listAllForAdmin();
    }

    @GetMapping("/summary")
    public SupportTicketSummaryResponse summary() {
        return supportTicketService.summary();
    }

    @PutMapping("/{ticketId}")
    public SupportTicketResponse update(
            @PathVariable Long ticketId,
            @Valid @RequestBody SupportTicketUpdateRequest request
    ) {
        return supportTicketService.updateForAdmin(ticketId, request);
    }
}
