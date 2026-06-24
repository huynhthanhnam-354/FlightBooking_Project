package com.flightbooking.web.dto;

import java.util.List;

public record PromotionDTO(
        Long id,
        String title,
        String description,
        int discountPercentage,
        String type, // FLIGHT, COMBO, HOTEL
        List<String> tags,
        String bannerUrl,
        boolean hotDeal
) {
}
