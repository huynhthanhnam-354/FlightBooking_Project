package com.flightbooking.web.dto;

import java.util.List;

public record AiAnalysisResponse(
        String departure,
        String arrival,
        String priceTrend,
        String priceTrendFlag,
        String aiAdvice,
        String weatherRecommendation,
        List<DayPricePoint> sevenDayForecast,
        String recommendation,
        String weatherAdvice,
        List<String> travelTips
) {}
