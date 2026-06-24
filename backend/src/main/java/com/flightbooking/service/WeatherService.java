package com.flightbooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherService {

    @Value("${app.weather.api-key:b1b15e88fa797225412429c1c50c122a1}")
    private String apiKey;

    @Value("${app.weather.base-url:https://api.openweathermap.org/data/2.5/weather}")
    private String baseUrl;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public record WeatherInfo(String status, int temperature) {}

    /**
     * Fetch actual weather forecast from OpenWeatherMap API.
     * Falls back to a deterministic simulation if the call fails.
     *
     * @param location Vietnamese location name (e.g. Đà Nẵng, Phú Quốc)
     * @return WeatherInfo record containing parsed status (Sunny, Rainy, Cloudy) and temperature
     */
    public WeatherInfo getWeatherForecast(String location) {
        if (location == null || location.isBlank()) {
            return getFallbackWeather("unknown");
        }

        try {
            // Translate Vietnamese location name to matching English query for OpenWeatherMap API accuracy
            String cityQuery = mapToEnglishCity(location);

            URI uri = UriComponentsBuilder.fromUriString(baseUrl)
                    .queryParam("q", cityQuery)
                    .queryParam("appid", apiKey.trim())
                    .queryParam("units", "metric")
                    .queryParam("lang", "vi")
                    .build()
                    .toUri();

            log.info("Requesting OpenWeatherMap API for query: {}", cityQuery);
            String response = restTemplate.getForObject(uri, String.class);
            if (response != null && !response.isBlank()) {
                JsonNode root = objectMapper.readTree(response);

                // Parse temperature
                int temp = 25;
                if (root.has("main") && root.path("main").has("temp")) {
                    temp = (int) Math.round(root.path("main").path("temp").asDouble());
                }

                // Parse weather status code groups
                String mainStatus = "Cloudy";
                if (root.has("weather") && root.path("weather").isArray() && root.path("weather").size() > 0) {
                    String main = root.path("weather").get(0).path("main").asText();
                    if (main != null) {
                        main = main.toLowerCase();
                        if (main.contains("clear") || main.contains("sunny")) {
                            mainStatus = "Sunny";
                        } else if (main.contains("rain") || main.contains("drizzle") || main.contains("thunderstorm")) {
                            mainStatus = "Rainy";
                        } else {
                            mainStatus = "Cloudy";
                        }
                    }
                }

                log.info("OpenWeatherMap result for '{}': status={}, temp={}", location, mainStatus, temp);
                return new WeatherInfo(mainStatus, temp);
            }
        } catch (Exception e) {
            log.error("Failed to query OpenWeatherMap for location: '{}'. Falling back to simulation. Error: {}", location, e.getMessage());
        }

        return getFallbackWeather(location);
    }

    private WeatherInfo getFallbackWeather(String location) {
        int hash = Math.abs(location.trim().hashCode());
        String[] statuses = {"Sunny", "Rainy", "Cloudy"};
        String status = statuses[hash % statuses.length];

        int temp = 25;
        if ("Sunny".equals(status)) {
            temp = 28 + (hash % 6); // 28 to 33
        } else if ("Rainy".equals(status)) {
            temp = 20 + (hash % 5); // 20 to 24
        } else {
            temp = 22 + (hash % 6); // 22 to 27
        }

        return new WeatherInfo(status, temp);
    }

    private String mapToEnglishCity(String location) {
        if (location == null) return "";
        String loc = location.trim().toLowerCase();
        if (loc.contains("đà nẵng")) return "Da Nang";
        if (loc.contains("phú quốc")) return "Phu Quoc";
        if (loc.contains("nha trang")) return "Nha Trang";
        if (loc.contains("sa pa")) return "Sa Pa";
        if (loc.contains("hạ long")) return "Ha Long";
        if (loc.contains("hà giang")) return "Ha Giang";
        if (loc.contains("hội an")) return "Hoi An";
        if (loc.contains("quy nhơn")) return "Quy Nhon";
        if (loc.contains("đà lạt")) return "Da Lat";
        if (loc.contains("côn đảo")) return "Con Dao";
        if (loc.contains("vũng tàu")) return "Vung Tau";
        if (loc.contains("mũi né")) return "Mui Ne";
        if (loc.contains("hà nội")) return "Hanoi";
        if (loc.contains("hồ chí minh") || loc.contains("sài gòn")) return "Ho Chi Minh City";
        return location;
    }
}
