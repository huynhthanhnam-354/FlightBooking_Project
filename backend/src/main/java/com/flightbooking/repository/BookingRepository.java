package com.flightbooking.repository;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserOrderByCreatedAtDesc(AppUser user);

    boolean existsByPnr(String pnr);
}
