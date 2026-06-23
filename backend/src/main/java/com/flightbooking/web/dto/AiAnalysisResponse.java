package com.flightbooking.web.dto;

import java.util.List;

public record AiAnalysisResponse(
        String departure,
        String arrival,
        String priceTrend, // "UP", "STABLE", "DOWN"
        String aiAdvice,   // "BUY_NOW", "MONITOR"
        String weatherRecommendation,
        List<DayPricePoint> sevenDayForecast
) {}
