package com.flightbooking.startup;

import com.flightbooking.model.Flight;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.time.VietnamTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FlightDataSeeder implements CommandLineRunner {

    private final FlightRepository flightRepository;

    @Override
    public void run(String... args) {
        long count = flightRepository.count();
        log.info("Checking flight data... Current count: {}", count);
        if (count == 0) {
            log.info("Seeding initial flight data...");
            seedFlights();
            log.info("Seeding complete. New count: {}", flightRepository.count());
        }
    }

    private void seedFlights() {
        LocalDateTime now = VietnamTime.nowLocal();
        
        // Seed flights for today and the next 7 days
        for (int i = 0; i <= 7; i++) {
            LocalDateTime day = now.plusDays(i);
            
            // Routes: HAN <-> SGN
            saveFlight("VN123", "Vietnam Airlines", "HAN", "SGN", day.withHour(8).withMinute(0), day.withHour(10).withMinute(15), 2450000L);
            saveFlight("VJ456", "Vietjet Air", "HAN", "SGN", day.withHour(12).withMinute(30), day.withHour(14).withMinute(45), 1200000L);
            saveFlight("QH789", "Bamboo Airways", "SGN", "HAN", day.withHour(15).withMinute(0), day.withHour(17).withMinute(15), 1850000L);
            
            // Routes: HAN <-> DAD (Da Nang)
            saveFlight("VN789", "Vietnam Airlines", "HAN", "DAD", day.withHour(9).withMinute(0), day.withHour(10).withMinute(20), 1450000L);
            saveFlight("VJ123", "Vietjet Air", "DAD", "HAN", day.withHour(18).withMinute(45), day.withHour(20).withMinute(0), 850000L);
        }
    }

    private void saveFlight(String no, String airline, String dep, String arr, LocalDateTime depAt, LocalDateTime arrAt, long price) {
        Flight f = Flight.builder()
                .flightNumber(no)
                .airline(airline)
                .departureAirport(dep)
                .arrivalAirport(arr)
                .departureAt(depAt)
                .arrivalAt(arrAt)
                .price(price)
                .durationMinutes(90)
                .premiumCabin(no.startsWith("VN"))
                .build();
        flightRepository.save(f);
    }
}
