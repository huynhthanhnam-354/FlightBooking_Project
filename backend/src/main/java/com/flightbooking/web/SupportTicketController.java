package com.flightbooking.web;

import com.flightbooking.service.SupportTicketService;
import com.flightbooking.web.dto.CreateSupportTicketRequest;
import com.flightbooking.web.dto.SupportTicketResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/support-tickets")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SupportTicketResponse create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody CreateSupportTicketRequest request
    ) {
        return supportTicketService.create(user.getUsername(), request);
    }

    @GetMapping("/me")
    public List<SupportTicketResponse> mine(@AuthenticationPrincipal UserDetails user) {
        return supportTicketService.listMine(user.getUsername());
    }
}
