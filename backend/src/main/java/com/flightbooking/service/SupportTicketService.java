package com.flightbooking.service;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.Booking;
import com.flightbooking.model.SupportTicket;
import com.flightbooking.model.SupportTicketStatus;
import com.flightbooking.repository.AppUserRepository;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.repository.SupportTicketRepository;
import com.flightbooking.time.VietnamTime;
import com.flightbooking.web.dto.CreateSupportTicketRequest;
import com.flightbooking.web.dto.SupportTicketResponse;
import com.flightbooking.web.dto.SupportTicketSummaryResponse;
import com.flightbooking.web.dto.SupportTicketUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final AppUserRepository appUserRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public SupportTicketResponse create(String userEmail, CreateSupportTicketRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        String pnr = clean(request.pnr());
        Booking booking = null;
        if (pnr != null) {
            booking = bookingRepository.findByPnrIgnoreCase(pnr)
                    .filter(b -> b.getUser().getId().equals(user.getId()))
                    .orElse(null);
        }

        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .booking(booking)
                .pnr(pnr)
                .category(cleanRequired(request.category()).toLowerCase(Locale.ROOT))
                .message(cleanRequired(request.message()))
                .status(SupportTicketStatus.OPEN)
                .build();
        supportTicketRepository.save(ticket);
        return toResponse(ticket);
    }

    @Transactional(readOnly = true)
    public List<SupportTicketResponse> listMine(String userEmail) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        return supportTicketRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SupportTicketResponse> listAllForAdmin() {
        return supportTicketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SupportTicketSummaryResponse summary() {
        long open = supportTicketRepository.countByStatus(SupportTicketStatus.OPEN);
        long inProgress = supportTicketRepository.countByStatus(SupportTicketStatus.IN_PROGRESS);
        long resolved = supportTicketRepository.countByStatus(SupportTicketStatus.RESOLVED);
        long closed = supportTicketRepository.countByStatus(SupportTicketStatus.CLOSED);
        return new SupportTicketSummaryResponse(
                open + inProgress + resolved + closed,
                open,
                inProgress,
                resolved,
                closed,
                Map.of(
                        "OPEN", open,
                        "IN_PROGRESS", inProgress,
                        "RESOLVED", resolved,
                        "CLOSED", closed
                )
        );
    }

    @Transactional
    public SupportTicketResponse updateForAdmin(Long ticketId, SupportTicketUpdateRequest request) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Support ticket not found"));
        ticket.setStatus(request.status());
        ticket.setAdminReply(clean(request.adminReply()));
        if (request.status() == SupportTicketStatus.RESOLVED || request.status() == SupportTicketStatus.CLOSED) {
            if (ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(VietnamTime.nowLocal());
            }
        } else {
            ticket.setResolvedAt(null);
        }
        return toResponse(ticket);
    }

    private SupportTicketResponse toResponse(SupportTicket ticket) {
        AppUser user = ticket.getUser();
        Booking booking = ticket.getBooking();
        return new SupportTicketResponse(
                ticket.getId(),
                "SB-" + String.format("%06d", ticket.getId()),
                user.getEmail(),
                user.getFullName(),
                booking == null ? null : booking.getId(),
                ticket.getPnr(),
                ticket.getCategory(),
                ticket.getMessage(),
                ticket.getAdminReply(),
                ticket.getStatus(),
                VietnamTime.toInstant(ticket.getCreatedAt()),
                VietnamTime.toInstant(ticket.getUpdatedAt()),
                ticket.getResolvedAt() == null ? null : VietnamTime.toInstant(ticket.getResolvedAt())
        );
    }

    private static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private static String cleanRequired(String value) {
        String cleaned = clean(value);
        if (cleaned == null) {
            throw new IllegalArgumentException("Value is required");
        }
        return cleaned;
    }
}
