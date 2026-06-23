package com.flightbooking.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private String reply;
    private String intent;
    private Double confidence;
    @Builder.Default
    private List<Suggestion> suggestions = List.of();
    @Builder.Default
    private List<Action> actions = List.of();
    @Builder.Default
    private List<Map<String, Object>> cards = List.of();

    public record Suggestion(String id, String label) {
    }

    public record Action(String type, String label, String route, Map<String, Object> payload) {
    }
}
