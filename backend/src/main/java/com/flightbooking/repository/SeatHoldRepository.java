package com.flightbooking.repository;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.Flight;
import com.flightbooking.model.SeatHold;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SeatHoldRepository extends JpaRepository<SeatHold, Long> {

    List<SeatHold> findByFlightAndExpiresAtAfter(Flight flight, LocalDateTime now);

    Optional<SeatHold> findByFlightAndSeatNumberAndExpiresAtAfter(Flight flight, String seatNumber, LocalDateTime now);

    Optional<SeatHold> findByFlightAndUserAndSeatNumberAndExpiresAtAfter(Flight flight, AppUser user, String seatNumber, LocalDateTime now);

    void deleteByFlightAndUserAndSeatNumberIn(Flight flight, AppUser user, Collection<String> seatNumbers);

    void deleteByFlightAndUserAndSeatNumber(Flight flight, AppUser user, String seatNumber);

    List<SeatHold> findByExpiresAtBefore(LocalDateTime now);

    void deleteByExpiresAtBefore(LocalDateTime now);
}
