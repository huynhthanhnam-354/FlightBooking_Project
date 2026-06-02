package com.flightbooking.service;

import com.flightbooking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PnrGenerator {

    private final BookingRepository bookingRepository;

    public String generate() {
        String pnr;
        int guard = 0;
        do {
            pnr = "SB" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
            guard++;
        } while (bookingRepository.existsByPnr(pnr) && guard < 20);
        
        if (bookingRepository.existsByPnr(pnr)) {
            pnr = "SB" + System.currentTimeMillis();
        }
        return pnr;
    }
}
