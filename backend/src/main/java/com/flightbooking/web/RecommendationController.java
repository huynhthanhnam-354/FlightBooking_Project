package com.flightbooking.web;

import com.flightbooking.model.Flight;
import com.flightbooking.repository.FlightRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.DecimalFormat;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RecommendationController {

    private final FlightRepository flightRepository;

    public RecommendationController(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    @GetMapping
    public List<RecommendationDTO> getRecommendations() {
        DecimalFormat formatter = new DecimalFormat("#,###");
        
        long halongPrice = getMinPrice("HAN", 1290000L);
        long danangPrice = getMinPrice("DAD", 890000L);
        long hanoiPrice = getMinPrice("HAN", 1050000L);
        long phuquocPrice = getMinPrice("PQC", 1450000L);

        return Arrays.asList(
                new RecommendationDTO(
                        1L,
                        "Vịnh Hạ Long",
                        "Khám phá kỳ quan thiên nhiên thế giới",
                        formatter.format(halongPrice) + "₫",
                        "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
                        "HAN"
                ),
                new RecommendationDTO(
                        2L,
                        "Đà Nẵng",
                        "Thành phố của những cây cầu",
                        formatter.format(danangPrice) + "₫",
                        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80",
                        "DAD"
                ),
                new RecommendationDTO(
                        3L,
                        "Hà Nội",
                        "Nét đẹp nghìn năm văn hiến",
                        formatter.format(hanoiPrice) + "₫",
                        "https://images.unsplash.com/photo-1555661530-68c8e98db4e6?auto=format&fit=crop&w=600&q=80",
                        "HAN"
                ),
                new RecommendationDTO(
                        4L,
                        "Phú Quốc",
                        "Thiên đường đảo ngọc",
                        formatter.format(phuquocPrice) + "₫",
                        "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=600&q=80",
                        "PQC"
                )
        );
    }

    private long getMinPrice(String airportCode, long fallback) {
        try {
            return flightRepository.findAll().stream()
                    .filter(f -> airportCode.equalsIgnoreCase(f.getArrivalAirport()))
                    .mapToLong(Flight::getPrice)
                    .min()
                    .orElse(fallback);
        } catch (Exception e) {
            return fallback;
        }
    }

    public static record RecommendationDTO(
            Long id,
            String name,
            String description,
            String price,
            String image,
            String destinationCode
    ) {}
}
