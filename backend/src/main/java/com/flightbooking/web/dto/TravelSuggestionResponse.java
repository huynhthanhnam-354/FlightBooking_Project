package com.flightbooking.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelSuggestionResponse {
    private String weather;
    private String priceTrend;
    private List<String> travelTips;
}
