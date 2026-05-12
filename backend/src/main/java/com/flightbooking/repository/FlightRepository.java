package com.flightbooking.repository;

import com.flightbooking.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FlightRepository extends JpaRepository<Flight, Long> {

    List<Flight> findByOriginCodeAndDestinationCodeOrderByDepartureAtAsc(
            String originCode,
            String destinationCode
    );

    Optional<Flight> findByOriginCodeAndDestinationCodeAndFlightNumberAndDepartureAt(
            String originCode,
            String destinationCode,
            String flightNumber,
            LocalDateTime departureAt
    );
}
