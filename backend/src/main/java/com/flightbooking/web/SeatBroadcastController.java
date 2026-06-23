package com.flightbooking.web;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map;

@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SeatBroadcastController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/flight/{flightId}/toggle-seat")
    public void toggleSeat(
            @DestinationVariable Long flightId,
            Map<String, Object> payload
    ) {
        messagingTemplate.convertAndSend("/topic/flight/" + flightId + "/seats", payload);
    }
}
