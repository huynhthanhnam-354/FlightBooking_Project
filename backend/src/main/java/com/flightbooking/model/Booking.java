package com.flightbooking.model;

import com.flightbooking.time.VietnamTime;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "bookings",
        indexes = {
                @Index(name = "idx_bookings_user_created", columnList = "user_id, created_at"),
                @Index(name = "idx_bookings_flight_status", columnList = "flight_id, status"),
                @Index(name = "idx_bookings_status_created", columnList = "status, created_at")
        }
)
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

    @Column(name = "seat_number", nullable = false, length = 64)
    private String seatNumber;

    @Column(name = "passenger_name", nullable = false, length = 200)
    private String passengerName;

    @Column(name = "passenger_email", length = 190)
    private String passengerEmail;

    @Column(name = "passenger_phone", length = 32)
    private String passengerPhone;

    @Column(name = "passenger_id_card", length = 64)
    private String passengerIdCard;

    @Column(name = "passenger_count", nullable = false)
    @Builder.Default
    private Integer passengerCount = 1;

    @Column(name = "trip_type", length = 24)
    private String tripType;

    @Column(name = "payment_method", length = 32)
    private String paymentMethod;

    @Column(name = "baggage_kg", nullable = false)
    @Builder.Default
    private Integer baggageKg = 0;

    @Column(name = "baggage_fee_vnd", nullable = false)
    @Builder.Default
    private Long baggageFeeVnd = 0L;

    @Column(name = "total_price_vnd", nullable = false)
    private Long totalPriceVnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Column(nullable = false, unique = true, length = 24)
    private String pnr;

    @Version
    private Integer version;

    @Column(name = "source_channel", nullable = false, length = 24)
    @Builder.Default
    private String sourceChannel = "MOBILE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(name = "check_in_channel", length = 24)
    private String checkInChannel;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingPassenger> passengers = new ArrayList<>();

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private PaymentTransaction paymentTransaction;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = VietnamTime.nowLocal();
        }
        if (status == null) {
            status = BookingStatus.CONFIRMED;
        }
        if (passengerCount == null || passengerCount <= 0) {
            passengerCount = 1;
        }
        if (baggageKg == null || baggageKg < 0) {
            baggageKg = 0;
        }
        if (baggageFeeVnd == null || baggageFeeVnd < 0) {
            baggageFeeVnd = 0L;
        }
        if (sourceChannel == null || sourceChannel.isBlank()) {
            sourceChannel = "MOBILE";
        }
    }

    public void addPassenger(BookingPassenger passenger) {
        passengers.add(passenger);
        passenger.setBooking(this);
    }

    public void setPaymentTransaction(PaymentTransaction paymentTransaction) {
        this.paymentTransaction = paymentTransaction;
        if (paymentTransaction != null) {
            paymentTransaction.setBooking(this);
        }
    }
}
