package com.flightbooking.web;

import com.flightbooking.service.FlightService;
import com.flightbooking.web.dto.FlightResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Senior Developer Refactor: Fixed non-repeatable annotation errors and standardized logging.
 */
@RestController
@RequestMapping("/api/v1/flights")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class FlightController {

    private final FlightService flightService;

    /**
     * Search for flights based on route and optional date.
     * Fixed: Removed duplicate @GetMapping and added ISO Date support.
     */
    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam("departureAirport") String departureAirport,
            @RequestParam("arrivalAirport") String arrivalAirport,
            @RequestParam(value = "start", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime start,
            @RequestParam(value = "end", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime end
    ) {
        try {
            log.info("Searching flights from {} to {} between {} and {}", departureAirport, arrivalAirport, start, end);
            List<FlightResponse> results = flightService.searchFlights(departureAirport, arrivalAirport, start, end);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error during flight search: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "error", "Search Failed",
                        "message", "Đã có lỗi xảy ra trong quá trình tìm kiếm chuyến bay."
                    ));
        }
    }

    /**
     * Retrieve booked seats for a specific flight to prevent double booking.
     */
    @GetMapping("/{id}/booked-seats")
    public ResponseEntity<?> getBookedSeats(@PathVariable Long id) {
        try {
            List<String> seats = flightService.getBookedSeats(id);
            return ResponseEntity.ok(seats);
        } catch (Exception e) {
            log.error("Error retrieving booked seats for flight {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
