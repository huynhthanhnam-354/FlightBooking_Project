package com.flightbooking.repository;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserOrderByCreatedAtDesc(AppUser user);

    List<Booking> findByFlightAndStatusNot(Flight flight, BookingStatus status);

    boolean existsByPnr(String pnr);
}
