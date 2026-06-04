package com.flightbooking.service;

import com.flightbooking.model.Flight;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.web.dto.ChatRequest;
import com.flightbooking.web.dto.ChatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatAiService {

    private final FlightRepository flightRepository;
    private final RestTemplate restTemplate;

    @Value("${app.ai.api-key}")
    private String apiKey;

    @Value("${app.ai.model}")
    private String model;

    @Value("${app.ai.url}")
    private String apiUrl;

    @Value("${app.n8n.chat-webhook-url:}")
    private String n8nWebhookUrl;

    @Value("${app.n8n.webhook-secret:}")
    private String n8nWebhookSecret;

    public ChatResponse generateResponse(ChatRequest request) {
        String message = request.getMessage() == null ? "" : request.getMessage().trim();
        if (message.isBlank()) {
            return ChatResponse.builder()
                    .reply("Vui long nhap cau hoi de tro ly AI ho tro ban.")
                    .build();
        }

        if (n8nWebhookUrl != null && !n8nWebhookUrl.isBlank()) {
            ChatResponse n8nResponse = callN8n(request, message);
            if (n8nResponse != null) {
                return n8nResponse;
            }
        }

        ChatResponse knowledgeResponse = answerFromKnowledgeBase(message);
        if (knowledgeResponse != null) {
            return knowledgeResponse;
        }

        return ChatResponse.builder()
                .reply(generateOpenAiReply(message))
                .build();
    }

    public String generateReply(String userMessage) {
        return generateOpenAiReply(userMessage);
    }

    private ChatResponse callN8n(ChatRequest request, String message) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("message", message);
        requestBody.put("sessionId", valueOrDefault(request.getSessionId(), UUID.randomUUID().toString()));
        requestBody.put("platform", valueOrDefault(request.getPlatform(), "unknown"));
        requestBody.put("language", valueOrDefault(request.getLanguage(), "vi"));
        Map<String, Object> context = new HashMap<>();
        if (request.getContext() != null) {
            context.putAll(request.getContext());
        }
        context.put("knowledgeBase", buildKnowledgeBase());
        requestBody.put("context", context);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (n8nWebhookSecret != null && !n8nWebhookSecret.isBlank()) {
            headers.set("X-Webhook-Secret", n8nWebhookSecret);
        }

        try {
            Map<String, Object> response = restTemplate.postForObject(
                    n8nWebhookUrl,
                    new HttpEntity<>(requestBody, headers),
                    Map.class
            );

            if (response == null) {
                throw new IllegalStateException("Empty response from n8n");
            }

            String reply = String.valueOf(response.getOrDefault("reply", "")).trim();
            if (reply.isBlank()) {
                return null;
            }

            return ChatResponse.builder()
                    .reply(reply)
                    .suggestions(parseSuggestions(response.get("suggestions")))
                    .build();
        } catch (Exception e) {
            return null;
        }
    }

    private String generateOpenAiReply(String userMessage) {
        List<Flight> flights = flightRepository.findAll();

        String context = flights.stream()
                .map(f -> String.format(
                        "- Chuyen bay %s cua %s: tu %s den %s, khoi hanh luc %s, gia %d VND",
                        f.getFlightNumber(),
                        f.getAirlineName(),
                        f.getOriginCode(),
                        f.getDestinationCode(),
                        f.getDepartureAt(),
                        f.getBasePriceVnd()
                ))
                .collect(Collectors.joining("\n"));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of(
                "role", "system",
                "content", "Ban la tro ly ao cua FlightBook AI. "
                        + "Duoi day la danh sach cac chuyen bay hien co:\n" + context + "\n"
                        + "Hay tra loi lich su, ngan gon, uu tien tieng Viet. "
                        + "Chi su dung du lieu chuyen bay da cung cap de tra loi. "
                        + "Neu khong tim thay thong tin phu hop, hay noi ro va de nghi tao yeu cau ho tro."
        ));
        messages.add(Map.of("role", "user", "content", userMessage));
        requestBody.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        try {
            Map<String, Object> response = restTemplate.postForObject(
                    apiUrl,
                    new HttpEntity<>(requestBody, headers),
                    Map.class
            );
            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, String> message = (Map<String, String>) firstChoice.get("message");
                    return message.get("content");
                }
            }
        } catch (Exception e) {
            return "He thong AI dang ban. Vui long thu lai sau. (AI: " + e.getMessage() + ")";
        }

        return "Toi khong the xu ly yeu cau nay ngay bay gio.";
    }

    private static String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static ChatResponse answerFromKnowledgeBase(String message) {
        String normalized = normalize(message);
        if (containsAny(normalized, "hanh ly", "baggage", "luggage", "ky gui", "xach tay")) {
            return ChatResponse.builder()
                    .reply(baggageReply(normalized))
                    .suggestions(List.of(
                            new ChatResponse.Suggestion("book-baggage", "Chọn hành lý khi đặt vé"),
                            new ChatResponse.Suggestion("extra-baggage", "Mua thêm hành lý"),
                            new ChatResponse.Suggestion("checkin", "Hướng dẫn check-in")
                    ))
                    .build();
        }

        if (containsAny(normalized, "check in", "check-in", "checkin", "boarding", "len may bay", "pnr")) {
            return ChatResponse.builder()
                    .reply("Bạn có thể check-in online trong mục Check-in trực tuyến. Nhập PNR và họ/tên cuối của hành khách, kiểm tra thông tin chuyến bay và hành lý, rồi xác nhận để tạo boarding pass trong app. Lưu ý: booking cần được thanh toán trước khi check-in; nếu có hành lý ký gửi, hãy đến quầy gửi hành lý trước giờ đóng quầy.")
                    .suggestions(List.of(
                            new ChatResponse.Suggestion("checkin", "Mở Check-in"),
                            new ChatResponse.Suggestion("ticket", "Xem vé của tôi"),
                            new ChatResponse.Suggestion("baggage", "Quy định hành lý")
                    ))
                    .build();
        }

        if (containsAny(normalized, "thanh toan", "payment", "pay", "tra tien", "chua thanh toan")) {
            return ChatResponse.builder()
                    .reply("Nếu booking đang chờ thanh toán, bạn có thể vào Vé của tôi để thanh toán. Sau khi thanh toán thành công, booking mới đủ điều kiện check-in. Nếu đã thanh toán nhưng trạng thái chưa đổi, hãy thử tải lại sau vài phút hoặc gửi yêu cầu hỗ trợ kèm PNR.")
                    .suggestions(List.of(
                            new ChatResponse.Suggestion("my-bookings", "Vé của tôi"),
                            new ChatResponse.Suggestion("support", "Gửi hỗ trợ"),
                            new ChatResponse.Suggestion("checkin", "Điều kiện check-in")
                    ))
                    .build();
        }

        if (containsAny(normalized, "doi ve", "doi lich", "huy ve", "hoan ve", "refund", "cancel", "change flight")) {
            return ChatResponse.builder()
                    .reply("Với đổi lịch, hủy vé hoặc hoàn vé, bạn vào mục Hỗ trợ, chọn đúng nhóm vấn đề và gắn booking liên quan. Điều kiện xử lý phụ thuộc hãng bay, hạng vé và trạng thái thanh toán. Nếu đã thanh toán, hệ thống cần kiểm tra chính sách trước khi xác nhận phí hoặc hoàn tiền.")
                    .suggestions(List.of(
                            new ChatResponse.Suggestion("support", "Mở Hỗ trợ"),
                            new ChatResponse.Suggestion("my-bookings", "Vé của tôi"),
                            new ChatResponse.Suggestion("payment", "Kiểm tra thanh toán")
                    ))
                    .build();
        }

        if (containsAny(normalized, "ve cua toi", "my ticket", "my booking", "ma dat cho", "ma ve", "e-ticket", "eticket", "pnr")) {
            return ChatResponse.builder()
                    .reply("Bạn có thể xem PNR, trạng thái thanh toán, ghế, hành lý và e-ticket trong mục Vé của tôi/Tài khoản. PNR là mã đặt chỗ dùng để tra cứu vé, gửi hỗ trợ và check-in online.")
                    .suggestions(List.of(
                            new ChatResponse.Suggestion("my-bookings", "Mở Vé của tôi"),
                            new ChatResponse.Suggestion("checkin", "Check-in bằng PNR"),
                            new ChatResponse.Suggestion("support", "Cần hỗ trợ PNR")
                    ))
                    .build();
        }

        if (containsAny(normalized, "tim chuyen", "tim ve", "chuyen bay", "flight search", "search flight", "ve re", "gia re", "bay thang")) {
            return ChatResponse.builder()
                    .reply("Bạn có thể vào tab Chuyến bay để tìm vé theo điểm đi, điểm đến, ngày bay và số hành khách. Sau khi chọn chuyến, hệ thống sẽ chuyển qua đặt vé, chọn ghế, chọn hành lý và thanh toán.")
                    .suggestions(List.of(
                            new ChatResponse.Suggestion("search-flight", "Tìm chuyến bay"),
                            new ChatResponse.Suggestion("book-baggage", "Đặt vé có hành lý"),
                            new ChatResponse.Suggestion("support", "Cần hỗ trợ")
                    ))
                    .build();
        }

        if (containsAny(normalized, "ho tro", "support", "lien he", "hotline", "email", "doi ve", "huy ve", "hoan ve")) {
            return ChatResponse.builder()
                    .reply("Bạn có thể vào mục Hỗ trợ để gắn booking liên quan, chọn nhóm vấn đề như đổi lịch, hoàn/hủy vé, thanh toán hoặc hành lý, rồi gửi yêu cầu. Với trường hợp khẩn cấp, dùng hotline hoặc email trong Trung tâm hỗ trợ.")
                    .suggestions(List.of(
                            new ChatResponse.Suggestion("support", "Mở Hỗ trợ"),
                            new ChatResponse.Suggestion("refund", "Hoàn/hủy vé"),
                            new ChatResponse.Suggestion("payment", "Lỗi thanh toán")
                    ))
                    .build();
        }

        return null;
    }

    private static String baggageReply(String normalized) {
        if (normalized.contains("mua")
                || normalized.contains("them")
                || normalized.contains("sau khi")
                || normalized.contains("cap nhat")
                || normalized.contains("update")) {
            return "Để mua thêm hoặc cập nhật hành lý cho vé đã đặt, vào mục Hành lý, chọn gói kg phù hợp và áp dụng vào booking hiện có. Hệ thống chỉ cho cập nhật hành lý với booking chưa thanh toán. Nếu booking đã thanh toán, vui lòng liên hệ Hỗ trợ hoặc hãng bay.";
        }

        return "Khi đặt vé mới, bạn có thể chọn gói hành lý ký gửi ngay trong luồng đặt vé, ở bước chi tiết chuyến bay/chọn ghế. Các gói hiện có gồm 0 kg, 15 kg, 20 kg, 25 kg, 30 kg và 40 kg. Mục Hành lý trên trang chủ dùng để mua thêm hoặc cập nhật hành lý cho booking hiện có chưa thanh toán.";
    }

    private static boolean containsAny(String value, String... keywords) {
        for (String keyword : keywords) {
            if (value.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private static String normalize(String value) {
        String withoutAccent = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return withoutAccent.toLowerCase();
    }

    private static Map<String, Object> buildKnowledgeBase() {
        return Map.of(
                "app", "Flight Booking / SkyBook",
                "currentFlows", List.of(
                        "Đặt vé mới: chọn chuyến bay -> chọn ghế -> chọn hành lý ký gửi -> nhập hành khách -> thanh toán.",
                        "Hành lý trên trang chủ: dùng để mua thêm hoặc cập nhật hành lý cho booking hiện có chưa thanh toán.",
                        "Check-in trực tuyến: nhập PNR và họ/tên cuối, booking phải được thanh toán trước khi check-in.",
                        "Hỗ trợ: tạo yêu cầu cho đổi lịch, hoàn/hủy vé, thanh toán, hành lý."
                ),
                "baggage", Map.of(
                        "packages", List.of(
                                Map.of("kg", 0, "feeVnd", 0, "label", "Chỉ xách tay"),
                                Map.of("kg", 15, "feeVnd", 160000, "label", "Gọn nhẹ"),
                                Map.of("kg", 20, "feeVnd", 220000, "label", "Phổ biến"),
                                Map.of("kg", 25, "feeVnd", 280000, "label", "Du lịch"),
                                Map.of("kg", 30, "feeVnd", 350000, "label", "Dài ngày"),
                                Map.of("kg", 40, "feeVnd", 480000, "label", "Tối đa")
                        ),
                        "bookingFlow", "Khi đặt vé mới, người dùng chọn hành lý ngay trong màn đặt vé, sau phần chọn ghế.",
                        "extraBaggage", "Mục Hành lý dùng để mua thêm/cập nhật hành lý cho booking hiện có chưa thanh toán.",
                        "rules", List.of(
                                "Xách tay thường tối đa 7 kg.",
                                "Chất lỏng xách tay nên chia chai nhỏ tối đa 100 ml.",
                                "Pin sạc dự phòng và thiết bị pin lithium nên mang trong hành lý xách tay.",
                                "Có hành lý ký gửi thì cần đến quầy gửi hành lý trước giờ đóng quầy."
                        )
                ),
                "checkin", Map.of(
                        "requirement", "Booking phải được thanh toán trước khi check-in.",
                        "steps", List.of(
                                "Vào Check-in trực tuyến.",
                                "Nhập PNR và họ/tên cuối của hành khách.",
                                "Kiểm tra hành khách, chuyến bay và hành lý.",
                                "Xác nhận check-in để tạo boarding pass trong app."
                        )
                ),
                "support", Map.of(
                        "topics", List.of("Đổi lịch bay", "Hoàn/hủy vé", "Thanh toán", "Hành lý"),
                        "note", "Người dùng có thể gắn booking liên quan khi gửi yêu cầu hỗ trợ."
                )
        );
    }

    private static List<ChatResponse.Suggestion> parseSuggestions(Object raw) {
        if (!(raw instanceof List<?> list)) {
            return List.of();
        }

        return list.stream()
                .map(item -> {
                    if (item instanceof Map<?, ?> map) {
                        Object idValue = map.containsKey("id") ? map.get("id") : map.get("label");
                        String id = idValue == null ? "" : String.valueOf(idValue);
                        Object labelValue = map.containsKey("label") ? map.get("label") : id;
                        String label = labelValue == null ? id : String.valueOf(labelValue);
                        return new ChatResponse.Suggestion(id, label);
                    }
                    String value = String.valueOf(item);
                    return new ChatResponse.Suggestion(value, value);
                })
                .filter(s -> !s.label().isBlank())
                .toList();
    }
}
