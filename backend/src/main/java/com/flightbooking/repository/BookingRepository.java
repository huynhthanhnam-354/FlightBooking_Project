package com.flightbooking.repository;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserOrderByCreatedAtDesc(AppUser user);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByFlightAndStatusNot(Flight flight, BookingStatus status);

    long countByStatus(BookingStatus status);

    boolean existsByPnr(String pnr);

    Optional<Booking> findByPnrIgnoreCase(String pnr);
}
