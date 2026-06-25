package com.flightbooking.web;

import com.flightbooking.service.AiAssistantService;
import com.flightbooking.service.ChatAiService;
import com.flightbooking.web.dto.AiAnalysisResponse;
import com.flightbooking.web.dto.TravelSuggestionRequest;
import com.flightbooking.web.dto.TravelSuggestionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;
    private final ChatAiService chatAiService;

    @GetMapping("/analyze")
    public AiAnalysisResponse analyzeRoute(
            @RequestParam String departure,
            @RequestParam String arrival,
            @RequestParam String date
    ) {
        return aiAssistantService.analyzeRoute(departure, arrival, date);
    }

    @PostMapping("/travel-suggestions")
    public TravelSuggestionResponse getTravelSuggestions(@RequestBody TravelSuggestionRequest request) {
        return chatAiService.getTravelSuggestions(request);
    }
}

