package com.flightbooking.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TravelSuggestionRequest {
    private String origin;
    private String destination;
    private String departureDate;
    private Integer passengers;
}
