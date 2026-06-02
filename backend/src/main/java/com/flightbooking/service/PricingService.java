package com.flightbooking.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingPolicy;

@Service
public class PricingService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.10"); // 10%
    private static final BigDecimal SERVICE_FEE_PER_PASSENGER = new BigDecimal("50000");

    /**
     * Tính tổng giá vé bao gồm thuế và phí dịch vụ.
     * Formula: (BasePrice * Passengers) + (BasePrice * Passengers * Tax) + (ServiceFee * Passengers)
     */
    public BigDecimal calculateTotalPrice(long basePriceVnd, int passengerCount) {
        if (passengerCount <= 0) {
            throw new IllegalArgumentException("Số lượng hành khách phải lớn hơn 0");
        }
        
        BigDecimal base = BigDecimal.valueOf(basePriceVnd);
        BigDecimal count = BigDecimal.valueOf(passengerCount);
        
        BigDecimal subtotal = base.multiply(count);
        BigDecimal taxAmount = subtotal.multiply(TAX_RATE);
        BigDecimal totalServiceFee = SERVICE_FEE_PER_PASSENGER.multiply(count);
        
        return subtotal.add(taxAmount).add(totalServiceFee).setScale(0, RoundingPolicy.HALF_UP);
    }
}
