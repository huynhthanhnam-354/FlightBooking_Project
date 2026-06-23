package com.flightbooking.web;

import com.flightbooking.service.AiComboService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AiComboController {

    private final AiComboService aiComboService;

    @GetMapping("/combo-suggest")
    public Map<String, Object> suggestCombo(@RequestParam String prompt) {
        return aiComboService.suggestCombo(prompt);
    }
}
