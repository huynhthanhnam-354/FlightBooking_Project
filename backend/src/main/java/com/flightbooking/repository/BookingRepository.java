package com.flightbooking.repository;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.model.Flight;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserOrderByCreatedAtDesc(AppUser user);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByFlightAndStatusNot(Flight flight, BookingStatus status);

    long countByStatus(BookingStatus status);

    List<Booking> findByStatusInOrderByCreatedAtDesc(List<BookingStatus> statuses);

    boolean existsByPnr(String pnr);

    Optional<Booking> findByPnrIgnoreCase(String pnr);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.id = :id")
    Optional<Booking> findByIdForUpdate(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.pnr = :pnr")
    Optional<Booking> findByPnrForUpdate(String pnr);

    List<Booking> findByStatusAndExpiresAtBefore(BookingStatus status, LocalDateTime now);
}
