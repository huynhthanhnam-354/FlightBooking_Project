package com.flightbooking.web;

import com.flightbooking.service.BookingService;
import com.flightbooking.web.dto.BookingAdminSummaryResponse;
import com.flightbooking.web.dto.BookingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final BookingService bookingService;

    @GetMapping
    public List<BookingResponse> allBookings() {
        return bookingService.listAllForAdmin();
    }

    @GetMapping("/summary")
    public BookingAdminSummaryResponse summary() {
        return bookingService.adminSummary();
    }
}
