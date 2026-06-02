package com.flightbooking.web;

import com.flightbooking.service.ChatAiService;
import com.flightbooking.web.dto.ChatRequest;
import com.flightbooking.web.dto.ChatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/chat")
@RequiredArgsConstructor
public class ChatAiController {

    private final ChatAiService chatAiService;

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        String reply = chatAiService.generateReply(request.getMessage());
        return ChatResponse.builder().reply(reply).build();
    }
}
