package com.flightbooking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Chuyến bay — bảng {@code flights}, đồng bộ catalog cho web/mobile.
 */
@Entity
@Table(name = "flights")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "flight_number", nullable = false, length = 20)
    private String flightNumber;

    @Column(name = "airline_name", nullable = false, length = 120)
    private String airlineName;

    @Column(name = "origin_code", nullable = false, length = 8)
    private String originCode;

    @Column(name = "destination_code", nullable = false, length = 8)
    private String destinationCode;

    @Column(name = "departure_at", nullable = false)
    private LocalDateTime departureAt;

    @Column(name = "arrival_at", nullable = false)
    private LocalDateTime arrivalAt;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "base_price_vnd", nullable = false)
    private Long basePriceVnd;

    /** Hạng thương gia (true) / phổ thông (false) — filter "Business" trên app */
    @Column(name = "premium_cabin", nullable = false)
    @Builder.Default
    private boolean premiumCabin = false;
}
