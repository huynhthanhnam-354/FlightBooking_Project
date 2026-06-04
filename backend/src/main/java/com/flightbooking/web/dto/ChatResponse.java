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
public class ChatResponse {
    private String reply;
    @Builder.Default
    private List<Suggestion> suggestions = List.of();

    public record Suggestion(String id, String label) {
    }
}
