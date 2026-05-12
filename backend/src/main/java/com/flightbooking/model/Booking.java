package com.flightbooking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.flightbooking.time.VietnamTime;

import java.time.LocalDateTime;

/**
 * Đặt chỗ — bảng {@code bookings}, liên kết {@link AppUser} + {@link Flight}.
 */
@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    @Column(name = "seat_number", nullable = false, length = 8)
    private String seatNumber;

    @Column(name = "passenger_name", nullable = false, length = 200)
    private String passengerName;

    @Column(name = "passenger_email", length = 190)
    private String passengerEmail;

    @Column(name = "passenger_phone", length = 32)
    private String passengerPhone;

    @Column(name = "total_price_vnd", nullable = false)
    private Long totalPriceVnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Column(nullable = false, unique = true, length = 24)
    private String pnr;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = VietnamTime.nowLocal();
        }
        if (status == null) {
            status = BookingStatus.CONFIRMED;
        }
    }
}
