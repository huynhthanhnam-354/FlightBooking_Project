package com.flightbooking.web;

import com.flightbooking.service.ComboService;
import com.flightbooking.web.dto.ComboPriceRequest;
import com.flightbooking.web.dto.ComboPriceResponse;
import com.flightbooking.web.dto.ComboResponse;
import com.flightbooking.web.dto.ComboCheckoutRequest;
import com.flightbooking.web.dto.ComboCheckoutResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/combos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ComboController {

    private final ComboService comboService;

    @GetMapping("/search")
    public List<ComboResponse> search(
            @RequestParam(required = false) String departure,
            @RequestParam(required = false) String arrival,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) String sortBy
    ) {
        return comboService.search(departure, arrival, date, guests, sortBy);
    }

    @PostMapping("/calculate-price")
    public ComboPriceResponse calculatePrice(@Valid @RequestBody ComboPriceRequest request) {
        return comboService.calculatePrice(request);
    }

    @PostMapping("/checkout")
    public ComboCheckoutResponse checkout(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody ComboCheckoutRequest request
    ) {
        // 🛠️ Gọi hàm đọc dữ liệu theo chuẩn Java Record (không có tiền tố get)
        String username = (user != null) ? user.getUsername() : request.passengerEmail();
        
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Thông tin danh tính hoặc email người đặt không được để trống");
        }
        
        return comboService.checkout(username, request);
    }
}