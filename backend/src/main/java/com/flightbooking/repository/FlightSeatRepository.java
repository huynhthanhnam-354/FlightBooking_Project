package com.flightbooking.repository;

import com.flightbooking.model.Flight;
import com.flightbooking.model.FlightSeat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlightSeatRepository extends JpaRepository<FlightSeat, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT fs FROM FlightSeat fs WHERE fs.flight.id = :flightId AND fs.seatNumber = :seatNumber")
    Optional<FlightSeat> findByFlightIdAndSeatNumberForUpdate(
            @Param("flightId") Long flightId,
            @Param("seatNumber") String seatNumber
    );

    Optional<FlightSeat> findByFlightAndSeatNumber(Flight flight, String seatNumber);
}
