package com.flightbooking.web.dto;

/**
 * Dữ liệu tra cứu chuyến bay trực tiếp (AirLabs ADS-B + tọa độ sân bay nội bộ).
 */
public record FlightTrackingResponse(
        String flightIata,
        String status,
        Double lat,
        Double lng,
        Integer altM,
        Integer speedKmh,
        Double headingDeg,
        String depIata,
        String arrIata,
        Double depLat,
        Double depLng,
        Double arrLat,
        Double arrLng,
        Long updatedUnix
) {}
