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

    @Query("""
            SELECT DISTINCT b FROM Booking b
            WHERE b.user = :user
               OR LOWER(b.passengerEmail) = LOWER(:email)
            ORDER BY b.createdAt DESC
            """)
    List<Booking> findMineOrderByCreatedAtDesc(
            @org.springframework.data.repository.query.Param("user") AppUser user,
            @org.springframework.data.repository.query.Param("email") String email
    );

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByFlightAndStatusNot(Flight flight, BookingStatus status);

    List<Booking> findByFlightAndStatusNotIn(Flight flight, List<BookingStatus> statuses);

    long countByStatus(BookingStatus status);

    long countByComboIdAndStatusIn(Long comboId, List<BookingStatus> statuses);

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

    @Query("SELECT CASE WHEN EXISTS (SELECT b FROM Booking b WHERE b.flight.id = :flightId AND (b.seatNumber = :seatNumber OR b.seatNumber LIKE CONCAT(:seatNumber, ',%') OR b.seatNumber LIKE CONCAT('%,', :seatNumber) OR b.seatNumber LIKE CONCAT('%,', :seatNumber, ',%')) AND b.status IN (:activeStatuses)) THEN true ELSE false END")
    boolean existsByFlightIdAndSeatNumberAndStatusIn(
            @org.springframework.data.repository.query.Param("flightId") Long flightId,
            @org.springframework.data.repository.query.Param("seatNumber") String seatNumber,
            @org.springframework.data.repository.query.Param("activeStatuses") List<BookingStatus> activeStatuses
    );
}
