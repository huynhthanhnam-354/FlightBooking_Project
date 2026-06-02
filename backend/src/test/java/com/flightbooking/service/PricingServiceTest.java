package com.flightbooking.service;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PricingServiceTest {

    private final PricingService pricingService = new PricingService();

    @Test
    void shouldCalculateCorrectTotalPriceForOnePassenger() {
        // Given
        long basePrice = 1000000; // 1,000,000 VND
        int passengers = 1;
        
        // Expected: (1,000,000 * 1) + (100,000 tax) + (50,000 fee) = 1,150,000
        BigDecimal expected = new BigDecimal("1150000");

        // When
        BigDecimal result = pricingService.calculateTotalPrice(basePrice, passengers);

        // Then
        assertThat(result).isEqualByComparingTo(expected);
    }

    @Test
    void shouldCalculateCorrectTotalPriceForMultiplePassengers() {
        // Given
        long basePrice = 2000000; // 2,000,000 VND
        int passengers = 2;
        
        // Expected:
        // Subtotal: 4,000,000
        // Tax (10%): 400,000
        // Fee (50k * 2): 100,000
        // Total: 4,500,000
        BigDecimal expected = new BigDecimal("4500000");

        // When
        BigDecimal result = pricingService.calculateTotalPrice(basePrice, passengers);

        // Then
        assertThat(result).isEqualByComparingTo(expected);
    }

    @Test
    void shouldThrowExceptionForInvalidPassengerCount() {
        assertThatThrownBy(() -> pricingService.calculateTotalPrice(1000000, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("lớn hơn 0");
    }
}
