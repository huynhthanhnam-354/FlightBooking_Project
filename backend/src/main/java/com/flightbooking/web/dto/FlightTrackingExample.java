package com.flightbooking.web.dto;

/** Một dòng gợi ý để người dùng thử tra cứu (chuyến đang có trong vùng bbox). */
public record FlightTrackingExample(
        String flightIata,
        String status,
        String depIata,
        String arrIata
) {}
