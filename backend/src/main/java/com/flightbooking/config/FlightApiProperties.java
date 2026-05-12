package com.flightbooking.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "flight.api")
public record FlightApiProperties(
        String baseUrl,
        String key,
        Double priceScale
) {
    public boolean isConfigured() {
        return key != null && !key.isBlank();
    }

    public double effectivePriceScale() {
        if (priceScale == null || priceScale <= 0 || priceScale.isNaN()) {
            return 2.0;
        }
        return priceScale;
    }
}
