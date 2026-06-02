package com.flightbooking.service;

import com.flightbooking.config.FlightApiProperties;
import com.flightbooking.integration.AirLabsScheduleSyncService;
import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.model.Flight;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.time.VietnamTime;
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
    private final BookingRepository bookingRepository;
    private final FlightApiProperties flightApiProperties;
    private final AirLabsScheduleSyncService airLabsScheduleSyncService;

    @Transactional(readOnly = true)
    public List<String> getBookedSeats(Long flightId) {
        Flight flight = getByIdOrThrow(flightId);
        
        // Lấy tất cả các ghế đã được đặt (CONFIRMED) hoặc đang được giữ (PENDING_PAYMENT & chưa hết hạn)
        return flight.getBookings().stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || 
                            (b.getStatus() == BookingStatus.PENDING_PAYMENT && b.getExpiresAt() != null && b.getExpiresAt().isAfter(VietnamTime.nowLocal())))
                .map(Booking::getSeatNumber)
                .flatMap(s -> java.util.Arrays.stream(s.split(","))) // Handle multiple seats in one string if needed
                .map(String::trim)
                .toList();
    }

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
