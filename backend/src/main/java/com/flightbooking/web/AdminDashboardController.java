package com.flightbooking.web;

import com.flightbooking.service.BookingService;
import com.flightbooking.web.dto.BookingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminDashboardController {

    private final BookingService bookingService;

    @GetMapping("/bookings")
    public List<BookingResponse> getSuccessfulBookings() {
        return bookingService.listSuccessfulBookingsForAdmin();
    }
}
