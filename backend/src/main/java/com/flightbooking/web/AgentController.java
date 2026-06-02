package com.flightbooking.web;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentController {

    @PostMapping("/chat")
    public AgentChatResponse chat(@RequestBody AgentChatRequest request) {
        String message = request.message() == null ? "" : request.message().toLowerCase(Locale.ROOT);
        String language = request.language() == null ? "vi" : request.language().toLowerCase(Locale.ROOT);
        boolean vi = language.equals("vi");

        if (containsAny(message, "bag", "baggage", "hanh ly", "hành lý")) {
            return response(
                    vi ? "Hành lý xách tay thường được miễn phí. Hành lý ký gửi cần mua thêm theo từng hãng và hạng vé."
                            : "Carry-on baggage is usually included. Checked baggage depends on airline and fare class.",
                    "baggage"
            );
        }
        if (containsAny(message, "check-in", "checkin", "boarding", "lên máy bay")) {
            return response(
                    vi ? "Bạn nên check-in online khi hãng mở cổng, thường trước giờ bay 24 giờ. Có mặt ở sân bay sớm để gửi hành lý."
                            : "Check in online when the airline opens it, often 24 hours before departure. Arrive early if you have checked baggage.",
                    "checkin"
            );
        }
        if (containsAny(message, "pnr", "ticket", "vé", "booking", "đặt chỗ")) {
            return response(
                    vi ? "Bạn có thể xem vé trong tab Hồ sơ > Lịch sử. Mở booking để xem PNR và e-ticket."
                            : "Open Profile > History to view bookings, PNR codes, and e-tickets.",
                    "tickets"
            );
        }
        if (containsAny(message, "track", "status", "trạng thái", "theo dõi")) {
            return response(
                    vi ? "Dùng mục Trạng thái chuyến bay và nhập mã IATA như VN213 để xem vị trí nếu có tín hiệu live."
                            : "Use Flight Status and enter an IATA code such as VN213 to view live position when available.",
                    "tracking"
            );
        }

        String from = contextValue(request.context(), "from");
        String to = contextValue(request.context(), "to");
        String date = contextValue(request.context(), "date");
        String passengers = contextValue(request.context(), "passengers");
        String route = from != null && to != null ? from + " -> " + to : null;
        String reply = vi
                ? "Mình có thể hỗ trợ tìm chuyến, xem hành lý, check-in, PNR và trạng thái bay."
                : "I can help with flight search, baggage, check-in, PNR, and flight status.";
        if (route != null) {
            reply += vi
                    ? " Tìm kiếm hiện tại: " + route + (date != null ? " ngày " + date : "") + (passengers != null ? ", " + passengers + " khách." : ".")
                    : " Current search: " + route + (date != null ? " on " + date : "") + (passengers != null ? ", " + passengers + " passengers." : ".");
        }
        return response(reply, "search");
    }

    private static AgentChatResponse response(String reply, String firstSuggestion) {
        return new AgentChatResponse(reply, List.of(
                new AgentSuggestion(firstSuggestion, firstSuggestion),
                new AgentSuggestion("support", "support")
        ));
    }

    private static boolean containsAny(String value, String... needles) {
        for (String needle : needles) {
            if (value.contains(needle)) {
                return true;
            }
        }
        return false;
    }

    private static String contextValue(Map<String, Object> context, String key) {
        if (context == null || !context.containsKey(key) || context.get(key) == null) {
            return null;
        }
        return String.valueOf(context.get(key));
    }

    public record AgentChatRequest(String message, Map<String, Object> context, String language) {
    }

    public record AgentChatResponse(String reply, List<AgentSuggestion> suggestions) {
    }

    public record AgentSuggestion(String id, String label) {
    }
}
