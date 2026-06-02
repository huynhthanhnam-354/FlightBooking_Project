package com.flightbooking.service;

import com.flightbooking.model.Flight;
import com.flightbooking.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatAiService {

    private final FlightRepository flightRepository;
    private final RestTemplate restTemplate;

    @Value("${app.ai.api-key}")
    private String apiKey;

    @Value("${app.ai.model}")
    private String model;

    @Value("${app.ai.url}")
    private String apiUrl;

    public String generateReply(String userMessage) {
        // 1. Get all active flights from DB
        List<Flight> flights = flightRepository.findAll();

        // 2. Prepare context
        String context = flights.stream()
                .map(f -> String.format("- Chuyến bay %s của %s: từ %s đến %s, khởi hành lúc %s, giá %d₫",
                        f.getFlightNumber(), f.getAirlineName(), f.getOriginCode(), f.getDestinationCode(),
                        f.getDepartureAt(), f.getBasePriceVnd()))
                .collect(Collectors.joining("\n"));

        // 3. Build OpenAI Request Body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);

        List<Map<String, String>> messages = new ArrayList<>();
        
        // System Prompt
        messages.add(Map.of(
            "role", "system",
            "content", "Bạn là trợ lý ảo thông minh của FlightBook AI. " +
                       "Dưới đây là danh sách các chuyến bay hiện có:\n" + context + "\n" +
                       "Hãy trả lời câu hỏi của người dùng một cách lịch sự, chuyên nghiệp. " +
                       "Lưu ý: CHỈ sử dụng dữ liệu chuyến bay đã cung cấp ở trên để trả lời. " +
                       "Nếu không tìm thấy chuyến bay phù hợp, hãy thông báo lịch sự."
        ));

        // User Message
        messages.add(Map.of("role", "user", "content", userMessage));

        requestBody.put("messages", messages);

        // 4. Send Request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(apiUrl, entity, Map.class);
            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, String> message = (Map<String, String>) firstChoice.get("message");
                    return message.get("content");
                }
            }
        } catch (Exception e) {
            return "Xin lỗi, hiện tại trợ lý AI đang bận. Vui lòng thử lại sau. (Lỗi: " + e.getMessage() + ")";
        }

        return "Tôi không thể xử lý yêu cầu này ngay bây giờ.";
    }
}
