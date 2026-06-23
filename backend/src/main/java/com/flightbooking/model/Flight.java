package com.flightbooking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "flights",
        indexes = {
                @Index(name = "idx_flights_route_departure", columnList = "departure_airport, arrival_airport, departure_at"),
                @Index(name = "idx_flights_departure", columnList = "departure_at")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_flights_route_number_departure",
                        columnNames = {"departure_airport", "arrival_airport", "flight_number", "departure_at"}
                )
        }
)
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
    private String airline;

    @Column(name = "departure_airport", nullable = false, length = 8)
    private String departureAirport;

    @Column(name = "arrival_airport", nullable = false, length = 8)
    private String arrivalAirport;

    @Column(name = "price", nullable = false)
    private Long price;

    @Column(name = "departure_at", nullable = false)
    private LocalDateTime departureAt;

    @Column(name = "arrival_at", nullable = false)
    private LocalDateTime arrivalAt;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "premium_cabin", nullable = false)
    @Builder.Default
    private boolean premiumCabin = false;

    @Version
    private Integer version;

    @OneToMany(mappedBy = "flight", fetch = FetchType.LAZY)
    private java.util.List<Booking> bookings;
}
