package com.flightbooking.service;

import com.flightbooking.model.Flight;
import com.flightbooking.integration.AirLabsScheduleSyncService;
import com.flightbooking.config.FlightApiProperties;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.web.dto.FlightResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightService {

    private final FlightRepository flightRepository;
    private final FlightApiProperties flightApiProperties;
    private final AirLabsScheduleSyncService airLabsScheduleSyncService;

    @Transactional
    public List<FlightResponse> search(String originCode, String destinationCode, LocalDate departureDate) {
        String o = originCode.trim().toUpperCase();
        String d = destinationCode.trim().toUpperCase();
        if (flightApiProperties.isConfigured()) {
            try {
                airLabsScheduleSyncService.syncSchedulesForRoute(o, d);
            } catch (Exception e) {
                log.warn("AirLabs sync skipped for {}→{}: {}", o, d, e.getMessage());
            }
        }
        List<Flight> flights;
        if (departureDate != null) {
            LocalDateTime start = departureDate.atStartOfDay();
            LocalDateTime end = departureDate.plusDays(1).atStartOfDay();
            flights = flightRepository.findByOriginCodeAndDestinationCodeAndDepartureAtBetweenOrderByDepartureAtAsc(
                    o, d, start, end
            );
        } else {
            flights = flightRepository.findByOriginCodeAndDestinationCodeOrderByDepartureAtAsc(o, d);
        }
        return flights
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Flight getByIdOrThrow(Long id) {
        return flightRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Flight not found: " + id));
    }

    public FlightResponse toResponse(Flight f) {
        return new FlightResponse(
                f.getId(),
                f.getFlightNumber(),
                f.getAirlineName(),
                f.getOriginCode(),
                f.getDestinationCode(),
                f.getDepartureAt(),
                f.getArrivalAt(),
                f.getDurationMinutes(),
                f.getBasePriceVnd(),
                f.isPremiumCabin()
        );
    }
}
