package com.flightbooking.web;

import com.flightbooking.service.BookingService;
import com.flightbooking.web.dto.BaggageUpdateRequest;
import com.flightbooking.web.dto.BookingResponse;
import com.flightbooking.web.dto.CheckInRequest;
import com.flightbooking.web.dto.CreateBookingRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/me")
    public List<BookingResponse> myBookings(@AuthenticationPrincipal UserDetails user) {
        return bookingService.listMine(user.getUsername());
    }

    @GetMapping("/occupied-seats")
    public List<String> occupiedSeats(@RequestParam Long flightId) {
        return bookingService.listOccupiedSeats(flightId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody CreateBookingRequest request
    ) {
        return bookingService.create(user.getUsername(), request);
    }

    @PutMapping("/{bookingId}/baggage")
    public BookingResponse updateBaggage(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long bookingId,
            @Valid @RequestBody BaggageUpdateRequest request
    ) {
        return bookingService.updateBaggage(user.getUsername(), bookingId, request);
    }

    @PostMapping("/check-in")
    public BookingResponse checkIn(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody CheckInRequest request
    ) {
        return bookingService.checkIn(user.getUsername(), request);
    }
}
