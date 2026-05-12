package com.flightbooking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flightbooking.config.FlightApiProperties;
import com.flightbooking.reference.AirportIataCoordinates;
import com.flightbooking.web.dto.FlightTrackingExample;
import com.flightbooking.web.dto.FlightTrackingResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.UnaryOperator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightTrackingService {

    private static final Pattern AIRLINE_NUM = Pattern.compile("^([A-Z]{2})([0-9]{1,4}[A-Z]?)$");

    private final FlightApiProperties flightApiProperties;
    private final ObjectMapper objectMapper;

    /**
     * @param flightIata đã chuẩn hóa (trim, upper), định dạng IATA hợp lệ
     */
    public Optional<FlightTrackingResponse> lookupLive(String flightIata) {
        if (!flightApiProperties.isConfigured()) {
            return Optional.empty();
        }
        String code = flightIata.trim().toUpperCase();
        String base = flightApiProperties.baseUrl().replaceAll("/+$", "");
        String key = flightApiProperties.key().trim();

        Optional<JsonNode> row = fetchFirstFlightRow(base, key, b -> b.queryParam("flight_iata", code));
        if (row.isEmpty()) {
            Matcher m = AIRLINE_NUM.matcher(code);
            if (m.matches()) {
                String airline = m.group(1);
                String num = m.group(2);
                row = fetchFirstFlightRow(base, key, b -> b
                        .queryParam("airline_iata", airline)
                        .queryParam("flight_number", num));
            }
        }
        return row.map(n -> toResponse(n, code));
    }

    /**
     * Chuyến bay đang có trong bbox — gợi ý mã tra cứu (AirLabs /flights).
     * Mặc định vùng rộng châu Á–Thái Bình Dương (gồm VN + nhiều tuyến quốc tế);
     * bbox: min_lat,min_lng,max_lat,max_lng theo AirLabs.
     */
    public List<FlightTrackingExample> listActiveOverVietnam(int limit) {
        if (!flightApiProperties.isConfigured()) {
            return List.of();
        }
        int lim = Math.min(Math.max(limit, 1), 40);
        String base = flightApiProperties.baseUrl().replaceAll("/+$", "");
        String key = flightApiProperties.key().trim();
        URI uri = UriComponentsBuilder.fromUriString(base + "/flights")
                .queryParam("api_key", key)
                .queryParam("bbox", "-18,95,52,155")
                .queryParam("limit", lim)
                .build()
                .toUri();

        String body = httpGet(uri);
        if (body == null) {
            return List.of();
        }
        JsonNode root;
        try {
            root = objectMapper.readTree(body);
        } catch (JsonProcessingException e) {
            log.warn("AirLabs flights examples invalid JSON: {}", e.getMessage());
            return List.of();
        }
        if (root.has("error")) {
            log.warn("AirLabs flights examples error: {}", root.path("error"));
            return List.of();
        }
        JsonNode rows = root.isArray() ? root : root.path("response");
        if (!rows.isArray() || rows.isEmpty()) {
            return List.of();
        }
        List<FlightTrackingExample> out = new ArrayList<>();
        for (JsonNode n : rows) {
            String fi = text(n, "flight_iata");
            if (fi == null || fi.isBlank()) {
                continue;
            }
            out.add(new FlightTrackingExample(
                    fi,
                    text(n, "status"),
                    text(n, "dep_iata"),
                    text(n, "arr_iata")
            ));
            if (out.size() >= lim) {
                break;
            }
        }
        return out;
    }

    private Optional<JsonNode> fetchFirstFlightRow(
            String base,
            String key,
            UnaryOperator<UriComponentsBuilder> params
    ) {
        UriComponentsBuilder b = UriComponentsBuilder.fromUriString(base + "/flights")
                .queryParam("api_key", key);
        URI uri = params.apply(b).build().toUri();
        String body = httpGet(uri);
        if (body == null) {
            return Optional.empty();
        }
        JsonNode root;
        try {
            root = objectMapper.readTree(body);
        } catch (JsonProcessingException e) {
            log.debug("AirLabs flights parse skip: {}", e.getMessage());
            return Optional.empty();
        }
        if (root.has("error")) {
            log.debug("AirLabs flights error node: {}", root.path("error"));
            return Optional.empty();
        }
        JsonNode rows = root.isArray() ? root : root.path("response");
        if (!rows.isArray() || rows.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(rows.get(0));
    }

    private String httpGet(URI uri) {
        try {
            return RestClient.builder().build().get().uri(uri).retrieve().body(String.class);
        } catch (Exception e) {
            log.warn("AirLabs GET {} failed: {}", uri.getPath(), e.getMessage());
            return null;
        }
    }

    private FlightTrackingResponse toResponse(JsonNode n, String fallbackFlightIata) {
        Double lat = readDouble(n, "lat");
        Double lng = readDouble(n, "lng");
        String dep = text(n, "dep_iata");
        String arr = text(n, "arr_iata");
        String fi = text(n, "flight_iata");
        if (fi == null || fi.isBlank()) {
            fi = fallbackFlightIata;
        }
        var depC = AirportIataCoordinates.forIata(dep);
        var arrC = AirportIataCoordinates.forIata(arr);
        return new FlightTrackingResponse(
                fi,
                text(n, "status"),
                lat,
                lng,
                readInt(n, "alt"),
                readInt(n, "speed"),
                readDouble(n, "dir"),
                dep,
                arr,
                depC.map(c -> c[0]).orElse(null),
                depC.map(c -> c[1]).orElse(null),
                arrC.map(c -> c[0]).orElse(null),
                arrC.map(c -> c[1]).orElse(null),
                readLong(n, "updated")
        );
    }

    private static String text(JsonNode n, String field) {
        JsonNode v = n.path(field);
        return v.isMissingNode() || v.isNull() ? null : v.asText(null);
    }

    private static Double readDouble(JsonNode n, String field) {
        JsonNode v = n.path(field);
        if (v.isMissingNode() || v.isNull() || !v.isNumber()) {
            return null;
        }
        return v.asDouble();
    }

    private static Integer readInt(JsonNode n, String field) {
        JsonNode v = n.path(field);
        if (v.isMissingNode() || v.isNull() || !v.isNumber()) {
            return null;
        }
        return v.asInt();
    }

    private static Long readLong(JsonNode n, String field) {
        JsonNode v = n.path(field);
        if (v.isMissingNode() || v.isNull() || !v.isNumber()) {
            return null;
        }
        return v.asLong();
    }
}
