package com.flightbooking.web;

import com.flightbooking.web.dto.PromotionDTO;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/v1/promotions")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PromotionController {

    @GetMapping
    public List<PromotionDTO> getPromotions() {
        return Arrays.asList(
                new PromotionDTO(
                        1L,
                        "HÀ GIANG HÙNG VĨ",
                        "Khám phá vẻ đẹp hoang sơ của cao nguyên đá và mùa hoa tam giác mạch.",
                        35,
                        "FLIGHT",
                        Arrays.asList("SEASONAL", "CULTURE"),
                        "https://images.unsplash.com/photo-1502101872923-d48509bff386?auto=format&fit=crop&w=800&q=80",
                        true
                ),
                new PromotionDTO(
                        2L,
                        "ĐẢO NGỌC PHÚ QUỐC",
                        "Trải nghiệm kỳ nghỉ thiên đường trọn gói: Chuyến bay & Resort ven biển.",
                        50,
                        "COMBO",
                        Arrays.asList("FULL PACKAGE", "BEACH"),
                        "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
                        false
                ),
                new PromotionDTO(
                        3L,
                        "NHA TRANG BIỂN HẸN",
                        "Tận hưởng bãi biển xanh ngắt với dải cát trắng mịn màng tại vịnh biển đẹp nhất Việt Nam.",
                        25,
                        "HOTEL",
                        Arrays.asList("BEACH", "RELAX"),
                        "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80",
                        false
                ),
                new PromotionDTO(
                        4L,
                        "SƠN ĐOÒNG BÍ ẨN",
                        "Khám phá hang động Sơn Đoòng - hang động tự nhiên lớn nhất thế giới ngay tại Việt Nam.",
                        40,
                        "FLIGHT",
                        Arrays.asList("DOMESTIC", "ADVENTURE"),
                        "https://images.unsplash.com/photo-1541014741259-df529411b96a?auto=format&fit=crop&w=800&q=80",
                        false
                )
        );
    }
}
