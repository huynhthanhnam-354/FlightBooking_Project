package com.flightbooking.service;

import com.flightbooking.model.Flight;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.web.dto.AiAnalysisResponse;
import com.flightbooking.web.dto.DayPricePoint;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiAssistantService {

    private final FlightRepository flightRepository;

    public AiAnalysisResponse analyzeRoute(String departure, String arrival, String dateStr) {
        List<Flight> flights = flightRepository.findByDepartureAirportAndArrivalAirportOrderByDepartureAtAsc(departure, arrival);

        long latestPrice = 0L;
        double previousMean = 0.0;

        if (!flights.isEmpty()) {
            latestPrice = flights.get(flights.size() - 1).getPrice();
            if (flights.size() > 1) {
                double sum = 0;
                for (int i = 0; i < flights.size() - 1; i++) {
                    sum += flights.get(i).getPrice();
                }
                previousMean = sum / (flights.size() - 1);
            } else {
                previousMean = latestPrice;
            }
        }

        String priceTrend = "STABLE";
        String aiAdvice = "MONITOR";

        if (latestPrice > 0 && previousMean > 0) {
            double changePercent = ((double) latestPrice - previousMean) / previousMean;
            if (changePercent > 0.05) {
                priceTrend = "UP";
                aiAdvice = "BUY_NOW";
            } else if (changePercent < -0.05) {
                priceTrend = "DOWN";
                aiAdvice = "MONITOR";
            }
        }

        String weatherRecommendation;
        String arr = arrival != null ? arrival.trim().toUpperCase() : "";
        if (arr.equals("HAN")) {
            weatherRecommendation = "Hà Nội đang vào mùa mát mẻ. Khuyên dùng: mang áo khoác mỏng, kính râm và chuẩn bị sẵn ô che mưa nhẹ.";
        } else if (arr.equals("DAD")) {
            weatherRecommendation = "Đà Nẵng thời tiết nắng ấm dễ chịu. Khuyên dùng: chuẩn bị trang phục đi biển, kem chống nắng và kính râm.";
        } else if (arr.equals("SGN")) {
            weatherRecommendation = "TP.HCM thời tiết ấm áp, có mưa rào rải rác về chiều. Khuyên dùng: mang theo ô/áo mưa nhỏ và quần áo nhẹ thoải mái.";
        } else {
            weatherRecommendation = "Thời tiết điểm đến ôn hòa, thích hợp dạo chơi. Khuyên dùng: trang phục thoải mái và chuẩn bị giày đi bộ.";
        }

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
            int dayOfWeekVal = targetDate.getDayOfWeek().getValue(); // 1 (Mon) to 7 (Sun)
            String label = dayOfWeekVal == 7 ? "Chủ Nhật" : "Thứ " + (dayOfWeekVal + 1);

            long stepPrice;
            if ("UP".equals(priceTrend)) {
                stepPrice = basePrice + (i * 120000L) + (long) (Math.random() * 50000L);
            } else if ("DOWN".equals(priceTrend)) {
                stepPrice = basePrice - (i * 80000L) + (long) (Math.random() * 40000L);
            } else {
                stepPrice = basePrice + (long) (Math.sin(i) * 50000L);
            }

            if (stepPrice < 400000L) {
                stepPrice = 400000L;
            }

            sevenDayForecast.add(new DayPricePoint(label, stepPrice));
        }

        return new AiAnalysisResponse(departure, arrival, priceTrend, aiAdvice, weatherRecommendation, sevenDayForecast);
    }
}
