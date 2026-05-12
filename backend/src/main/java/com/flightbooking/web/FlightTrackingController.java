package com.flightbooking.web;

import com.flightbooking.config.FlightApiProperties;
import com.flightbooking.service.FlightTrackingService;
import com.flightbooking.web.dto.FlightTrackingExample;
import com.flightbooking.web.dto.FlightTrackingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/flight-tracking")
@RequiredArgsConstructor
public class FlightTrackingController {

    private static final Pattern FLIGHT_IATA = Pattern.compile("^[A-Z]{2}[0-9]{1,4}[A-Z]?$");

    private final FlightApiProperties flightApiProperties;
    private final FlightTrackingService flightTrackingService;

    @GetMapping
    public ResponseEntity<?> get(@RequestParam("flightIata") String flightIata) {
        if (!flightApiProperties.isConfigured()) {
            return ResponseEntity.status(503).body(Map.of(
                    "code", "FLIGHT_API_NOT_CONFIGURED",
                    "message", "Set flight.api.key (e.g. in application-local.properties) to enable live tracking."
            ));
        }
        String code = flightIata == null ? "" : flightIata.trim().toUpperCase();
        if (!FLIGHT_IATA.matcher(code).matches()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "code", "INVALID_FLIGHT_IATA",
                    "message", "Expected format like VN213 or VJ189 (airline IATA + flight number)."
            ));
        }
        return flightTrackingService.lookupLive(code)
                .map(ResponseEntity::<FlightTrackingResponse>ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Danh sách chuyến đang có tín hiệu trong vùng bbox (mặc định châu Á–Thái Bình Dương) — gợi ý mã tra cứu.
     */
    @GetMapping("/examples")
    public ResponseEntity<?> examples(@RequestParam(name = "limit", defaultValue = "12") int limit) {
        if (!flightApiProperties.isConfigured()) {
            return ResponseEntity.status(503).body(Map.of(
                    "code", "FLIGHT_API_NOT_CONFIGURED",
                    "message", "Set flight.api.key to enable live tracking."
            ));
        }
        List<FlightTrackingExample> list = flightTrackingService.listActiveOverVietnam(limit);
        return ResponseEntity.ok(list);
    }
}