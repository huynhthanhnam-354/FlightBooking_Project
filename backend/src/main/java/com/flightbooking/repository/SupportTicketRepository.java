package com.flightbooking.repository;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.SupportTicket;
import com.flightbooking.model.SupportTicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findByUserOrderByCreatedAtDesc(AppUser user);

    List<SupportTicket> findAllByOrderByCreatedAtDesc();

    long countByStatus(SupportTicketStatus status);
}
