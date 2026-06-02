package com.flightbooking.web;

import com.flightbooking.service.FlightService;
import com.flightbooking.web.dto.FlightResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;

    @GetMapping
    public List<FlightResponse> search(
            @RequestParam String origin,
            @RequestParam String destination
    ) {
        return flightService.search(origin, destination);
    }

    @GetMapping("/{id}/booked-seats")
    public List<String> getBookedSeats(@PathVariable Long id) {
        return flightService.getBookedSeats(id);
    }
}
