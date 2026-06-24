package com.flightbooking.service;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.Flight;
import com.flightbooking.model.SeatHold;
import com.flightbooking.repository.AppUserRepository;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.repository.SeatHoldRepository;
import com.flightbooking.time.VietnamTime;
import com.flightbooking.web.dto.SeatHoldResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SeatHoldService {

    private static final int HOLD_MINUTES = 10;

    private final SeatHoldRepository seatHoldRepository;
    private final FlightRepository flightRepository;
    private final AppUserRepository appUserRepository;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public SeatHoldResponse hold(String userEmail, Long flightId, String rawSeatNumber) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        Flight flight = flightRepository.findByIdForUpdate(flightId)
                .orElseThrow(() -> new IllegalArgumentException("Flight not found: " + flightId));
        String seatNumber = normalizeSeat(rawSeatNumber);
        LocalDateTime now = VietnamTime.nowLocal();

        if (bookingService.occupiedSeatsForFlight(flight).contains(seatNumber)) {
            throw new IllegalStateException("Ghế này đã được đặt hoặc đang được giữ. Vui lòng chọn ghế khác.");
        }

        SeatHold hold = seatHoldRepository
                .findByFlightAndSeatNumberAndExpiresAtAfter(flight, seatNumber, now)
                .orElse(null);
        if (hold != null && !hold.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Ghế này đang được người khác giữ. Vui lòng chọn ghế khác.");
        }

        LocalDateTime expiresAt = now.plusMinutes(HOLD_MINUTES);
        if (hold == null) {
            hold = SeatHold.builder()
                    .flight(flight)
                    .user(user)
                    .seatNumber(seatNumber)
                    .expiresAt(expiresAt)
                    .build();
        } else {
            hold.setExpiresAt(expiresAt);
        }
        seatHoldRepository.save(hold);
        broadcast(flightId, seatNumber, "HOLD");
        return toResponse(flightId, seatNumber, expiresAt);
    }

    @Transactional
    public void release(String userEmail, Long flightId, String rawSeatNumber) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        Flight flight = flightRepository.getByIdOrThrow(flightId);
        String seatNumber = normalizeSeat(rawSeatNumber);
        seatHoldRepository.deleteByFlightAndUserAndSeatNumber(flight, user, seatNumber);
        broadcast(flightId, seatNumber, "UNHOLD");
    }

    @Transactional
    public void cleanupExpired() {
        LocalDateTime now = VietnamTime.nowLocal();
        seatHoldRepository.findByExpiresAtBefore(now)
                .forEach(hold -> broadcast(hold.getFlight().getId(), hold.getSeatNumber(), "UNHOLD"));
        seatHoldRepository.deleteByExpiresAtBefore(now);
    }

    private SeatHoldResponse toResponse(Long flightId, String seatNumber, LocalDateTime expiresAt) {
        long remainingSeconds = Math.max(0L, Duration.between(VietnamTime.nowLocal(), expiresAt).getSeconds());
        return new SeatHoldResponse(
                flightId,
                seatNumber,
                true,
                VietnamTime.toInstant(expiresAt),
                remainingSeconds
        );
    }

    private void broadcast(Long flightId, String seatNumber, String actionStatus) {
        messagingTemplate.convertAndSend(
                "/topic/flight/" + flightId + "/seats",
                Map.of("seatNumber", seatNumber, "actionStatus", actionStatus)
        );
    }

    private static String normalizeSeat(String seatNumber) {
        if (seatNumber == null || seatNumber.isBlank()) {
            throw new IllegalArgumentException("Seat number is required");
        }
        return seatNumber.trim().toUpperCase(Locale.ROOT);
    }
}
