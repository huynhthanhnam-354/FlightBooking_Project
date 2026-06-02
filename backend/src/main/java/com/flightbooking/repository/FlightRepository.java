package com.flightbooking.repository;

import com.flightbooking.model.Flight;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FlightRepository extends JpaRepository<Flight, Long> {

    List<Flight> findByOriginCodeAndDestinationCodeOrderByDepartureAtAsc(
            String originCode,
            String destinationCode
    );

    List<Flight> findByOriginCodeAndDestinationCodeAndDepartureAtBetweenOrderByDepartureAtAsc(
            String originCode,
            String destinationCode,
            LocalDateTime start,
            LocalDateTime end
    );

    Optional<Flight> findByOriginCodeAndDestinationCodeAndFlightNumberAndDepartureAt(
            String originCode,
            String destinationCode,
            String flightNumber,
            LocalDateTime departureAt
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM Flight f WHERE f.id = :id")
    Optional<Flight> findByIdForUpdate(Long id);
}
