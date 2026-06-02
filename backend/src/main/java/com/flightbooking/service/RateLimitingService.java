package com.flightbooking.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    // Lưu trữ các bucket theo key (IP hoặc Username)
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    /**
     * Lấy hoặc tạo mới một bucket cho một key cụ thể.
     * Cấu hình mặc định: 5 request mỗi phút.
     */
    public Bucket resolveBucket(String key) {
        return buckets.computeIfAbsent(key, this::newBucket);
    }

    private Bucket newBucket(String key) {
        // Bandwidth: Cho phép tối đa 5 tokens (requests)
        // Refill: Hồi phục 5 tokens mỗi 1 phút
        return Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1))))
                .build();
    }
}
