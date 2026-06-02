package com.flightbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private String bookingCode;
    private String customerName;
    private String customerEmail;
    
    // Thông tin chuyến bay
    private String flightCode;
    private String departureCity;
    private String arrivalCity;
    private LocalDateTime departureTime;
    private String seatNumber;
    
    // Thông tin tài chính
    private BigDecimal basePrice;
    private BigDecimal taxAmount;
    private BigDecimal totalPrice;
}
