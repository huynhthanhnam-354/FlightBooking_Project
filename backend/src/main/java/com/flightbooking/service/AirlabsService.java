package com.flightbooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flightbooking.web.dto.FlightResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AirlabsService {

    @Value("${app.airlabs.api-key:YOUR_API_KEY}")
    private String apiKey;

    @Value("${app.airlabs.base-url:https://airlabs.co/api/v9}")
    private String baseUrl;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    private static final DateTimeFormatter AIRLABS_DT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /**
     * Call Airlabs /schedules API to get real-time flight schedules for a destination airport.
     *
     * @param arrIata arrival airport code (IATA)
     * @return list of mapped FlightResponse objects, empty list if error or no results
     */
    public List<FlightResponse> getRealTimeSchedules(String arrIata) {
        List<FlightResponse> flights = new ArrayList<>();
        if (apiKey == null || apiKey.isBlank() || "YOUR_API_KEY".equals(apiKey)) {
            log.warn("Airlabs API Key is not configured. Falling back to local data.");
            return flights;
        }

        try {
            String base = baseUrl.replaceAll("/+$", "");
            URI uri = UriComponentsBuilder.fromUriString(base + "/schedules")
                    .queryParam("arr_iata", arrIata)
                    .queryParam("api_key", apiKey.trim())
                    .queryParam("limit", 20)
                    .build()
                    .toUri();

            log.info("Calling Airlabs API schedules for arr_iata: {}", arrIata);
            String response = restTemplate.getForObject(uri, String.class);
            if (response == null || response.isBlank()) {
                return flights;
            }

            JsonNode root = objectMapper.readTree(response);
            if (root.has("error")) {
                log.warn("Airlabs API error response: {}", root.path("error"));
                return flights;
            }

            JsonNode rows = root.path("response");
            if (!rows.isArray()) {
                if (root.isArray()) {
                    rows = root;
                } else {
                    return flights;
                }
            }

            long mockIdCounter = 20000L;
            for (JsonNode node : rows) {
                try {
                    String depIata = text(node, "dep_iata");
                    String arrIataField = text(node, "arr_iata");
                    if (depIata == null || arrIataField == null) {
                        continue;
                    }

                    LocalDateTime dep = parseTime(node, "dep_estimated", "dep_time");
                    LocalDateTime arr = parseTime(node, "arr_estimated", "arr_time");
                    if (dep == null) {
                        continue;
                    }
                    if (arr == null || !arr.isAfter(dep)) {
                        int dur = node.path("duration").asInt(120);
                        arr = dep.plusMinutes(Math.max(dur, 30));
                    }

                    String flightNo = text(node, "flight_iata");
                    if (flightNo == null || flightNo.isBlank()) {
                        String al = text(node, "airline_iata");
                        String num = text(node, "flight_number");
                        if (al != null && num != null) {
                            flightNo = al + num;
                        }
                    }
                    if (flightNo == null || flightNo.isBlank()) {
                        continue;
                    }

                    int duration = (int) ChronoUnit.MINUTES.between(dep, arr);
                    if (duration <= 0) {
                        duration = node.path("duration").asInt(90);
                    }

                    // Dynamic price estimation
                    long basePrice = 850_000L + (Math.abs(flightNo.hashCode()) % 400_000);
                    long price = basePrice + (long) duration * 2500L;

                    String airline = airlineDisplayName(text(node, "airline_iata"));

                    flights.add(new FlightResponse(
                            mockIdCounter++,
                            flightNo,
                            airline,
                            depIata,
                            arrIataField,
                            dep,
                            arr,
                            duration,
                            price,
                            false
                    ));
                } catch (Exception e) {
                    log.debug("Skipping row parsing for Airlabs schedule row: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to query or parse Airlabs schedules: {}", e.getMessage());
        }

        return flights;
    }

    private static String text(JsonNode n, String field) {
        if (!n.has(field) || n.get(field).isNull()) {
            return null;
        }
        String s = n.get(field).asText();
        return s == null || s.isBlank() ? null : s;
    }

    private static LocalDateTime parseTime(JsonNode n, String... fields) {
        for (String f : fields) {
            String t = text(n, f);
            if (t == null) {
                continue;
            }
            try {
                return LocalDateTime.parse(t, AIRLABS_DT);
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private static String airlineDisplayName(String iata) {
        if (iata == null || iata.isBlank()) {
            return "Airline";
        }
        return switch (iata.toUpperCase()) {
            case "VN" -> "Vietnam Airlines";
            case "VJ" -> "VietJet Air";
            case "QH" -> "Bamboo Airways";
            case "BL", "0V" -> "Pacific Airlines";
            default -> iata + " Airlines";
        };
    }
}
