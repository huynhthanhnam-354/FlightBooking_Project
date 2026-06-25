package com.flightbooking.web;

import com.flightbooking.service.ChatAiService;
import com.flightbooking.service.RateLimitingService;
import com.flightbooking.web.dto.ChatRequest;
import com.flightbooking.web.dto.ChatResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/chat")
@RequiredArgsConstructor
public class ChatAiController {

    private final ChatAiService chatAiService;
    private final RateLimitingService rateLimitingService;

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatRequest request, HttpServletRequest servletRequest) {
        // Xác định định danh người dùng (IP hoặc Username)
        String key = resolveClientKey(servletRequest);

        // Kiểm tra token trong Redis / Bucket4j
        if (rateLimitingService.tryConsume(key)) {
            ChatResponse response = chatAiService.generateResponse(request);
            return ResponseEntity.ok(response);
        }

        // Nếu hết token, trả về lỗi 429
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body("Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.");
    }

    private String resolveClientKey(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName(); // Sử dụng username nếu đã đăng nhập
        }
        // Sử dụng IP nếu chưa đăng nhập
        String remoteAddr = request.getHeader("X-Forwarded-For");
        if (remoteAddr == null || remoteAddr.isEmpty()) {
            remoteAddr = request.getRemoteAddr();
        }
        return remoteAddr;
    }
}
