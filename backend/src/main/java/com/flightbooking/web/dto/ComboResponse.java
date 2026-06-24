package com.flightbooking.web.dto;

import java.util.List;

public record ComboResponse(
        Long id,
        String title,
        String location,
        String hotelName,
        int hotelStars,
        String roomQuality,
        List<String> hotelAmenities,
        Long price,
        String region,
        String description,
        String duration,
        String image,
        int popularity,
        int discount,
        String aiRecommendation,
        int availableSlots,
        FlightResponse flight,
        List<RoomTypeResponse> roomTypes
) {
}
