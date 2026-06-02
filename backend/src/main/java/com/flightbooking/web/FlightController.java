package com.flightbooking.web;

import com.flightbooking.service.FlightService;
import com.flightbooking.web.dto.FlightResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;

    @GetMapping
    public List<FlightResponse> search(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate departureDate
    ) {
        return flightService.search(origin, destination, departureDate);
    }

    @GetMapping("/{id}/booked-seats")
    public List<String> getBookedSeats(@PathVariable Long id) {
        return flightService.getBookedSeats(id);
    }
}
