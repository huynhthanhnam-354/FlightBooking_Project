package com.flightbooking.service;

import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.model.Flight;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.time.VietnamTime;
import com.flightbooking.web.dto.FlightResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Senior Spring Boot Developer Refactor: 
 * Standardized searchFlights method signatures and implemented robust fallback logic for overloaded methods.
 */
@Service
@RequiredArgsConstructor
public class FlightService {

    private final FlightRepository flightRepository;
    private final com.flightbooking.integration.AirLabsScheduleSyncService airLabsSyncService;

    /**
     * Main search method using LocalDateTime range.
     */
    @Transactional
    public List<FlightResponse> searchFlights(String departureAirport, String arrivalAirport, LocalDateTime start, LocalDateTime end) {
        String dep = (departureAirport != null) ? departureAirport.trim().toUpperCase() : "";
        String arr = (arrivalAirport != null) ? arrivalAirport.trim().toUpperCase() : "";
        
        LocalDateTime now = VietnamTime.nowLocal();
        LocalDateTime effectiveStart = (start == null || start.isBefore(now)) ? now : start;

        List<Flight> flights;
        if (end == null) {
            flights = flightRepository.findByDepartureAirportAndArrivalAirportAndDepartureAtAfterOrderByDepartureAtAsc(dep, arr, effectiveStart);
        } else {
            if (end.isBefore(effectiveStart)) {
                return List.of();
            }
            flights = flightRepository.findByDepartureAirportAndArrivalAirportAndDepartureAtBetweenOrderByDepartureAtAsc(
                    dep, arr, effectiveStart, end
            );
        }

        // SENIOR ARCHITECT FIX: If no flights found locally, try to sync from AirLabs
        if (flights.isEmpty() && dep.length() == 3 && arr.length() == 3) {
            airLabsSyncService.syncSchedulesForRoute(dep, arr);
            // Re-query after sync to return the fresh data
            if (end == null) {
                flights = flightRepository.findByDepartureAirportAndArrivalAirportAndDepartureAtAfterOrderByDepartureAtAsc(dep, arr, effectiveStart);
            } else {
                flights = flightRepository.findByDepartureAirportAndArrivalAirportAndDepartureAtBetweenOrderByDepartureAtAsc(
                        dep, arr, effectiveStart, end
                );
            }
        }

        return flights.stream().map(this::toResponse).toList();
    }

    /**
     * Overloaded method with safe fallback boundaries (Current moment to 7 days ahead).
     * Fixed the 'Cannot resolve method' compile error.
     */
    @Transactional
    public List<FlightResponse> searchFlights(String from, String to) {
        LocalDateTime start = VietnamTime.nowLocal();
        LocalDateTime end = start.plusDays(7).with(LocalTime.MAX);
        return searchFlights(from, to, start, end);
    }

    @Transactional(readOnly = true)
    public Flight getFlightById(Long id) {
        return flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Flight getByIdOrThrow(Long id) {
        return getFlightById(id);
    }

    @Transactional(readOnly = true)
    public List<String> getBookedSeats(Long flightId) {
        Flight flight = getFlightById(flightId);
        return flight.getBookings().stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || 
                            (b.getStatus() == BookingStatus.PENDING_PAYMENT && b.getExpiresAt() != null && b.getExpiresAt().isAfter(VietnamTime.nowLocal())))
                .map(Booking::getSeatNumber)
                .flatMap(s -> java.util.Arrays.stream(s.split(",")))
                .map(String::trim)
                .toList();
    }

    public FlightResponse toResponse(Flight f) {
        return new FlightResponse(
                f.getId(),
                f.getFlightNumber(),
                f.getAirline(),
                f.getDepartureAirport(),
                f.getArrivalAirport(),
                f.getDepartureAt(),
                f.getArrivalAt(),
                f.getDurationMinutes(),
                f.getPrice(),
                f.isPremiumCabin()
        );
    }
}
