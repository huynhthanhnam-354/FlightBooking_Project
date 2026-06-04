package com.flightbooking.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String message;
    private String sessionId;
    private String platform;
    private String language;
    private Map<String, Object> context;
}
