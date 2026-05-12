package com.flightbooking.time;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Múi giờ ứng dụng (Việt Nam). Dùng cho {@code created_at} lưu trong DB dạng giờ địa phương,
 * tránh lệch 7h khi map {@link Instant} → {@code DATETIME} không có timezone.
 */
public final class VietnamTime {

    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private VietnamTime() {}

    public static LocalDateTime nowLocal() {
        return LocalDateTime.now(ZONE);
    }

    /** Chuyển thời điểm lưu trong DB (giờ VN) sang Instant cho JSON/API. */
    public static Instant toInstant(LocalDateTime localWallClock) {
        if (localWallClock == null) {
            return null;
        }
        return localWallClock.atZone(ZONE).toInstant();
    }
}
