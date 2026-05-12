package com.flightbooking.integration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flightbooking.config.FlightApiProperties;
import com.flightbooking.model.Flight;
import com.flightbooking.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

/**
 * Gọi AirLabs Schedules API và lưu/ghi đè chuyến bay theo tuyến để {@link com.flightbooking.service.FlightService} trả về có id thật (đặt vé).
 * <p>AirLabs <strong>không</strong> trả giá bán lẻ; {@code basePriceVnd} là ước lượng nội bộ × {@link com.flightbooking.config.FlightApiProperties#effectivePriceScale()}.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AirLabsScheduleSyncService {

    private static final DateTimeFormatter AIRLABS_DT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final FlightApiProperties flightApiProperties;
    private final FlightRepository flightRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void syncSchedulesForRoute(String originIata, String destinationIata) {
        if (!flightApiProperties.isConfigured()) {
            return;
        }
        String base = flightApiProperties.baseUrl().replaceAll("/+$", "");
        URI uri = UriComponentsBuilder.fromUriString(base + "/schedules")
                .queryParam("dep_iata", originIata)
                .queryParam("arr_iata", destinationIata)
                .queryParam("api_key", flightApiProperties.key().trim())
                .queryParam("limit", 50)
                .build()
                .toUri();

        RestClient client = RestClient.builder().build();
        String body = client.get()
                .uri(uri)
                .retrieve()
                .body(String.class);

        JsonNode root;
        try {
            root = objectMapper.readTree(body);
        } catch (JsonProcessingException e) {
            log.warn("AirLabs invalid JSON for {}→{}: {}", originIata, destinationIata, e.getMessage());
            return;
        }
        if (root.has("error")) {
            String msg = root.path("error").toString();
            log.warn("AirLabs error for {}→{}: {}", originIata, destinationIata, msg);
            return;
        }
        JsonNode rows = root.path("response");
        if (!rows.isArray()) {
            if (root.isArray()) {
                rows = root;
            } else {
                log.warn("AirLabs unexpected JSON for {}→{}", originIata, destinationIata);
                return;
            }
        }
        int saved = 0;
        for (JsonNode node : rows) {
            try {
                if (upsertOne(node, originIata, destinationIata)) {
                    saved++;
                }
            } catch (Exception e) {
                log.debug("Skip schedule row: {}", e.getMessage());
            }
        }
        if (saved > 0) {
            log.info("AirLabs: synced {} schedules for {}→{}", saved, originIata, destinationIata);
        }
    }

    private boolean upsertOne(JsonNode n, String routeOrigin, String routeDest) {
        String depIata = text(n, "dep_iata");
        String arrIata = text(n, "arr_iata");
        if (depIata == null || arrIata == null || !routeOrigin.equals(depIata) || !routeDest.equals(arrIata)) {
            return false;
        }
        LocalDateTime dep = firstNonNullTime(n, "dep_estimated", "dep_time");
        LocalDateTime arr = firstNonNullTime(n, "arr_estimated", "arr_time");
        if (dep == null) {
            return false;
        }
        if (arr == null || !arr.isAfter(dep)) {
            int dur = n.path("duration").asInt(120);
            arr = dep.plusMinutes(Math.max(dur, 30));
        }
        String flightNumber = text(n, "flight_iata");
        if (flightNumber == null || flightNumber.isBlank()) {
            String al = text(n, "airline_iata");
            String num = text(n, "flight_number");
            if (al != null && num != null) {
                flightNumber = al + num;
            }
        }
        if (flightNumber == null || flightNumber.isBlank()) {
            return false;
        }
        final String flightNo = flightNumber;
        int duration = (int) ChronoUnit.MINUTES.between(dep, arr);
        if (duration <= 0) {
            duration = n.path("duration").asInt(90);
        }
        long rawVnd = estimatePriceVnd(duration, flightNo);
        long price = Math.round(rawVnd * flightApiProperties.effectivePriceScale());

        Optional<Flight> existing = flightRepository
                .findByOriginCodeAndDestinationCodeAndFlightNumberAndDepartureAt(depIata, arrIata, flightNo, dep);
        Flight f = existing.orElseGet(() -> Flight.builder()
                .originCode(depIata)
                .destinationCode(arrIata)
                .flightNumber(flightNo)
                .build());
        f.setAirlineName(airlineDisplayName(text(n, "airline_iata")));
        f.setDepartureAt(dep);
        f.setArrivalAt(arr);
        f.setDurationMinutes(duration);
        f.setBasePriceVnd(price);
        f.setPremiumCabin(false);
        flightRepository.save(f);
        return true;
    }

    /** Giá minh họa — AirLabs schedules không có fare OTA; điều chỉnh tổng qua {@code flight.api.price-scale}. */
    private static long estimatePriceVnd(int durationMinutes, String flightNumber) {
        long base = 750_000L + (Math.abs(flightNumber.hashCode()) % 400_000);
        return base + (long) durationMinutes * 2_000L;
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
            case "AA", "UA", "DL" -> iata + " (intl)";
            default -> iata + " Airlines";
        };
    }

    private static String text(JsonNode n, String field) {
        if (!n.has(field) || n.get(field).isNull()) {
            return null;
        }
        String s = n.get(field).asText();
        return s == null || s.isBlank() ? null : s;
    }

    private static LocalDateTime firstNonNullTime(JsonNode n, String... fields) {
        for (String f : fields) {
            String t = text(n, f);
            if (t == null) {
                continue;
            }
            try {
                return LocalDateTime.parse(t, AIRLABS_DT);
            } catch (DateTimeParseException ignored) {
                // try next
            }
        }
        return null;
    }
}
