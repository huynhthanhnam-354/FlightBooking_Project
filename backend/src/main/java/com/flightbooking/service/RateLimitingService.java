package com.flightbooking.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitingService {

    private final StringRedisTemplate redisTemplate;
    
    // Fallback in-memory rate limiter buckets
    private final Map<String, Bucket> localBuckets = new ConcurrentHashMap<>();

    private static final int LIMIT = 5;
    private static final long WINDOW_SECONDS = 60;

    /**
     * Try to consume 1 token for a given key (IP or Username).
     * Returns true if allowed, false if rate limited.
     */
    public boolean tryConsume(String key) {
        try {
            // 1. Attempt Redis-based rate limiting for multi-node support
            long currentMinute = System.currentTimeMillis() / 60000;
            String redisKey = "rate:limit:" + key + ":" + currentMinute;

            Long count = redisTemplate.opsForValue().increment(redisKey);
            if (count != null) {
                if (count == 1) {
                    redisTemplate.expire(redisKey, WINDOW_SECONDS + 10, TimeUnit.SECONDS);
                }
                return count <= LIMIT;
            }
        } catch (Exception e) {
            log.warn("Redis is unavailable for rate limiting (key: {}). Falling back to local memory Bucket4j. Error: {}", key, e.getMessage());
        }

        // 2. Fallback to in-memory Bucket4j if Redis fails or is not configured
        Bucket bucket = localBuckets.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(LIMIT, Refill.intervally(LIMIT, Duration.ofMinutes(1))))
                .build());
        return bucket.tryConsume(1);
    }
}
