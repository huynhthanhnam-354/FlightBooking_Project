package com.flightbooking.repository;

import com.flightbooking.model.Flight;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {

    List<Flight> findByDepartureAirportAndArrivalAirport(String departureAirport, String arrivalAirport);

    List<Flight> findByDepartureAirportAndArrivalAirportOrderByDepartureAtAsc(String departureAirport, String arrivalAirport);

    List<Flight> findByDepartureAirportAndArrivalAirportAndDepartureAtBetweenOrderByDepartureAtAsc(
            String departureAirport,
            String arrivalAirport,
            LocalDateTime start,
            LocalDateTime end
    );

    Optional<Flight> findByDepartureAirportAndArrivalAirportAndFlightNumberAndDepartureAt(
            String departureAirport,
            String arrivalAirport,
            String flightNumber,
            LocalDateTime departureAt
    );

    /**
     * SENIOR DBA FIX: Standard query without locking the whole flight row.
     */
    @Query("SELECT f FROM Flight f WHERE f.id = :id")
    Optional<Flight> findByIdForUpdate(Long id);

    List<Flight> findByArrivalAirport(String arrivalAirport);

    List<Flight> findByArrivalAirportAndDepartureAtBetween(String arrivalAirport, LocalDateTime start, LocalDateTime end);

    @Query("SELECT f FROM Flight f WHERE f.departureAt >= :now ORDER BY f.departureAt ASC")
    List<Flight> findUpcomingFlights(@Param("now") LocalDateTime now, org.springframework.data.domain.Pageable pageable);

    /**
     * SENIOR DEV FIX: Helper method for clean functional code and standard error handling.
     */
    default Flight getByIdOrThrow(Long id) {
        return findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyến bay với ID: " + id));
    }
}
