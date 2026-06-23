package com.flightbooking.web;

import com.flightbooking.service.AiAssistantService;
import com.flightbooking.web.dto.AiAnalysisResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    @GetMapping("/analyze")
    public AiAnalysisResponse analyzeRoute(
            @RequestParam String departure,
            @RequestParam String arrival,
            @RequestParam String date
    ) {
        return aiAssistantService.analyzeRoute(departure, arrival, date);
    }
}
