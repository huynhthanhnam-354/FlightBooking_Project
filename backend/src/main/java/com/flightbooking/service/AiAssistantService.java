package com.flightbooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.flightbooking.model.Flight;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.web.dto.AiAnalysisResponse;
import com.flightbooking.web.dto.DayPricePoint;
import com.flightbooking.web.dto.FlightResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiAssistantService {

    private final FlightRepository flightRepository;
    private final AirlabsService airlabsService;
    private final WeatherService weatherService;

    @Value("${app.ai.api-key}")
    private String apiKey;

    @Value("${app.ai.model}")
    private String model;

    @Value("${app.ai.url}")
    private String apiUrl;

    public AiAnalysisResponse analyzeRoute(String departure, String arrival, String dateStr) {
        // 1. Resolve English name of arrival city for WeatherService query
        String destinationCity = getCityName(arrival);
        WeatherService.WeatherInfo weatherInfo = weatherService.getWeatherForecast(destinationCity);

        // 2. Fetch flight prices using AirlabsService schedules
        List<FlightResponse> airlabsFlights = airlabsService.getRealTimeSchedules(arrival);
        List<FlightResponse> routeFlights = airlabsFlights.stream()
                .filter(f -> departure.equalsIgnoreCase(f.departureAirport()))
                .collect(Collectors.toList());

        long latestPrice = 0L;
        double previousMean = 0.0;

        if (!routeFlights.isEmpty()) {
            latestPrice = routeFlights.get(routeFlights.size() - 1).price();
            double sum = 0;
            for (FlightResponse f : routeFlights) {
                sum += f.price();
            }
            previousMean = sum / routeFlights.size();
        } else {
            // Check flight database as fallback
            List<Flight> dbFlights = flightRepository.findByDepartureAirportAndArrivalAirportOrderByDepartureAtAsc(departure, arrival);
            if (!dbFlights.isEmpty()) {
                latestPrice = dbFlights.get(dbFlights.size() - 1).getPrice();
                if (dbFlights.size() > 1) {
                    double sum = 0;
                    for (int i = 0; i < dbFlights.size() - 1; i++) {
                        sum += dbFlights.get(i).getPrice();
                    }
                    previousMean = sum / (dbFlights.size() - 1);
                } else {
                    previousMean = latestPrice;
                }
            }
        }

        String priceTrendFlag = "STABLE";
        String aiAdvice = "MONITOR";
        double changePercent = 0.0;

        if (latestPrice > 0 && previousMean > 0) {
            changePercent = ((double) latestPrice - previousMean) / previousMean;
            if (changePercent > 0.05) {
                priceTrendFlag = "UP";
                aiAdvice = "BUY_NOW";
            } else if (changePercent < -0.05) {
                priceTrendFlag = "DOWN";
                aiAdvice = "MONITOR";
            }
        }

        // 3. Generate 7-day forecast points for chart
        LocalDate startDate;
        try {
            startDate = LocalDate.parse(dateStr);
        } catch (Exception e) {
            startDate = LocalDate.now();
        }

        List<DayPricePoint> sevenDayForecast = new ArrayList<>();
        long basePrice = latestPrice > 0 ? latestPrice : 1500000L;

        for (int i = 0; i < 7; i++) {
            LocalDate targetDate = startDate.plusDays(i);
            int dayOfWeekVal = targetDate.getDayOfWeek().getValue();
            String label = dayOfWeekVal == 7 ? "Chủ Nhật" : "Thứ " + (dayOfWeekVal + 1);

            long stepPrice;
            if ("UP".equals(priceTrendFlag)) {
                stepPrice = basePrice + (i * 120000L) + (long) (Math.random() * 50000L);
            } else if ("DOWN".equals(priceTrendFlag)) {
                stepPrice = basePrice - (i * 80000L) + (long) (Math.random() * 40000L);
            } else {
                stepPrice = basePrice + (long) (Math.sin(i) * 50000L);
            }

            if (stepPrice < 400000L) {
                stepPrice = 400000L;
            }

            sevenDayForecast.add(new DayPricePoint(label, stepPrice));
        }

        // 4. Query OpenAI for rich travel intelligence
        String priceTrendDesc = "";
        String recommendation = "";
        String weatherAdvice = "";
        List<String> travelTips = new ArrayList<>();

        if (apiKey != null && !apiKey.isBlank() && apiUrl != null && !apiUrl.isBlank()) {
            try {
                String systemPrompt = "You are a helpful travel analyst. Analyze the route and weather details, and return a JSON matching this schema:\n"
                        + "{\n"
                        + "  \"priceTrend\": \"detailed price trend description (e.g. 'Giá hiện tại thấp hơn trung bình 8%') in Vietnamese\",\n"
                        + "  \"recommendation\": \"booking advice (e.g. 'Nên đặt vé trong 24 giờ tới') in Vietnamese\",\n"
                        + "  \"weatherAdvice\": \"weather warning/advice (e.g. 'Có khả năng mưa nhẹ tại điểm đến') in Vietnamese\",\n"
                        + "  \"travelTips\": [\"tip 1 in Vietnamese\", \"tip 2 in Vietnamese\", \"tip 3 in Vietnamese\"]\n"
                        + "}\n"
                        + "Only return the raw JSON object. Do not include markdown wrappers (like ```json) or any extra text.";

                String userPrompt = String.format(
                        "Trip: %s to %s on %s.\n"
                        + "Current Flight Price: %d VND, Historical Mean Price: %.1f VND.\n"
                        + "Destination Weather Status: %s, Temp: %d°C.",
                        departure, arrival, dateStr, latestPrice, previousMean, weatherInfo.status(), weatherInfo.temperature()
                );

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", model);
                List<Map<String, String>> messages = new ArrayList<>();
                messages.add(Map.of("role", "system", "content", systemPrompt));
                messages.add(Map.of("role", "user", "content", userPrompt));
                requestBody.put("messages", messages);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(apiKey);

                RestTemplate restTemplate = new RestTemplate();
                Map<String, Object> response = restTemplate.postForObject(
                        apiUrl,
                        new HttpEntity<>(requestBody, headers),
                        Map.class
                );

                if (response != null && response.containsKey("choices")) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> firstChoice = choices.get(0);
                        Map<String, String> aiMessage = (Map<String, String>) firstChoice.get("message");
                        String content = aiMessage.get("content").trim();
                        if (content.startsWith("```json")) {
                            content = content.substring(7);
                        }
                        if (content.startsWith("```")) {
                            content = content.substring(3);
                        }
                        if (content.endsWith("```")) {
                            content = content.substring(0, content.length() - 3);
                        }
                        content = content.trim();

                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        JsonNode rootNode = mapper.readTree(content);
                        priceTrendDesc = rootNode.path("priceTrend").asText();
                        recommendation = rootNode.path("recommendation").asText();
                        weatherAdvice = rootNode.path("weatherAdvice").asText();
                        if (rootNode.has("travelTips") && rootNode.path("travelTips").isArray()) {
                            for (JsonNode tipNode : rootNode.path("travelTips")) {
                                travelTips.add(tipNode.asText());
                            }
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("OpenAI Price Trend intelligence error, falling back: " + e.getMessage());
            }
        }

        // 5. Rich Local Fallback Generator
        if (priceTrendDesc.isEmpty()) {
            if (latestPrice > 0 && previousMean > 0) {
                int diffPercent = (int) Math.round(Math.abs(changePercent) * 100);
                if (changePercent > 0.05) {
                    priceTrendDesc = String.format("Giá hiện tại cao hơn trung bình %d%%", diffPercent);
                    recommendation = "Theo dõi thêm biến động giá vé";
                } else if (changePercent < -0.05) {
                    priceTrendDesc = String.format("Giá hiện tại thấp hơn trung bình %d%%", diffPercent);
                    recommendation = "Nên đặt vé trong 24 giờ tới";
                } else {
                    priceTrendDesc = "Giá vé đang ổn định so với trung bình";
                    recommendation = "Nên đặt vé sớm để giữ chỗ";
                }
            } else {
                priceTrendDesc = "Giá vé duy trì ở mức trung bình ổn định";
                recommendation = "Nên đặt vé sớm 15-20 ngày";
            }
        }

        if (weatherAdvice.isEmpty()) {
            String status = weatherInfo.status().toLowerCase();
            if (status.contains("clear") || status.contains("sun")) {
                weatherAdvice = "Thời tiết nắng ấm, bầu trời quang đãng";
            } else if (status.contains("rain") || status.contains("driz") || status.contains("storm")) {
                weatherAdvice = "Có khả năng mưa rào tại điểm đến";
            } else {
                weatherAdvice = "Trời nhiều mây, khí hậu dịu mát ôn hòa";
            }
        }

        if (travelTips.isEmpty()) {
            travelTips.add("Chuẩn bị trang phục thích hợp cho nhiệt độ " + weatherInfo.temperature() + "°C.");
            travelTips.add("Nên đến sân bay sớm ít nhất 2 giờ trước khi khởi hành.");
            travelTips.add("Thời tiết phù hợp cho các hoạt động tham quan tại " + destinationCity + ".");
        }

        // Compile combined response structure
        return new AiAnalysisResponse(
                departure,
                arrival,
                priceTrendDesc,
                priceTrendFlag,
                aiAdvice,
                weatherInfo.status(), // Weather status goes to legacy weatherRecommendation field
                sevenDayForecast,
                recommendation,
                weatherAdvice,
                travelTips
        );
    }

    private String getCityName(String iata) {
        if ("HAN".equalsIgnoreCase(iata)) return "Hà Nội";
        if ("SGN".equalsIgnoreCase(iata)) return "Hồ Chí Minh";
        if ("DAD".equalsIgnoreCase(iata)) return "Đà Nẵng";
        if ("PQC".equalsIgnoreCase(iata)) return "Phú Quốc";
        if ("CXR".equalsIgnoreCase(iata)) return "Nha Trang";
        if ("DLI".equalsIgnoreCase(iata)) return "Đà Lạt";
        if ("HUI".equalsIgnoreCase(iata)) return "Huế";
        if ("VII".equalsIgnoreCase(iata)) return "Vinh";
        if ("HPH".equalsIgnoreCase(iata)) return "Hải Phòng";
        if ("VCA".equalsIgnoreCase(iata)) return "Cần Thơ";
        return iata;
    }
}
