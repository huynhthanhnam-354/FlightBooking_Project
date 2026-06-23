package com.flightbooking.service;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.model.SupportTicket;
import com.flightbooking.model.SupportTicketStatus;
import com.flightbooking.repository.AppUserRepository;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.repository.SupportTicketRepository;
import com.flightbooking.time.VietnamTime;
import com.flightbooking.web.dto.CreateSupportTicketRequest;
import com.flightbooking.web.dto.SupportTicketResponse;
import com.flightbooking.web.dto.SupportTicketSummaryResponse;
import com.flightbooking.web.dto.SupportTicketUpdateRequest;
import com.flightbooking.web.dto.SupportWorkflowResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final AppUserRepository appUserRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public SupportTicketResponse create(String userEmail, CreateSupportTicketRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        String pnr = clean(request.pnr());
        Booking booking = null;
        if (pnr != null) {
            booking = bookingRepository.findByPnrIgnoreCase(pnr)
                    .filter(b -> b.getUser().getId().equals(user.getId()))
                    .orElse(null);
        }

        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .booking(booking)
                .pnr(pnr)
                .category(cleanRequired(request.category()).toLowerCase(Locale.ROOT))
                .message(cleanRequired(request.message()))
                .status(SupportTicketStatus.OPEN)
                .build();
        supportTicketRepository.save(ticket);
        return toResponse(ticket);
    }

    @Transactional(readOnly = true)
    public List<SupportTicketResponse> listMine(String userEmail) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(userEmail));
        return supportTicketRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SupportTicketResponse> listAllForAdmin() {
        return supportTicketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SupportTicketSummaryResponse summary() {
        long open = supportTicketRepository.countByStatus(SupportTicketStatus.OPEN);
        long inProgress = supportTicketRepository.countByStatus(SupportTicketStatus.IN_PROGRESS);
        long resolved = supportTicketRepository.countByStatus(SupportTicketStatus.RESOLVED);
        long closed = supportTicketRepository.countByStatus(SupportTicketStatus.CLOSED);
        return new SupportTicketSummaryResponse(
                open + inProgress + resolved + closed,
                open,
                inProgress,
                resolved,
                closed,
                Map.of(
                        "OPEN", open,
                        "IN_PROGRESS", inProgress,
                        "RESOLVED", resolved,
                        "CLOSED", closed
                )
        );
    }

    @Transactional
    public SupportTicketResponse updateForAdmin(Long ticketId, SupportTicketUpdateRequest request) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Support ticket not found"));
        ticket.setStatus(request.status());
        ticket.setAdminReply(clean(request.adminReply()));
        if (request.status() == SupportTicketStatus.RESOLVED || request.status() == SupportTicketStatus.CLOSED) {
            if (ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(VietnamTime.nowLocal());
            }
        } else {
            ticket.setResolvedAt(null);
        }
        return toResponse(ticket);
    }

    private SupportTicketResponse toResponse(SupportTicket ticket) {
        AppUser user = ticket.getUser();
        Booking booking = ticket.getBooking();
        return new SupportTicketResponse(
                ticket.getId(),
                "SB-" + String.format("%06d", ticket.getId()),
                user.getEmail(),
                user.getFullName(),
                booking == null ? null : booking.getId(),
                ticket.getPnr(),
                ticket.getCategory(),
                ticket.getMessage(),
                ticket.getAdminReply(),
                ticket.getStatus(),
                VietnamTime.toInstant(ticket.getCreatedAt()),
                VietnamTime.toInstant(ticket.getUpdatedAt()),
                ticket.getResolvedAt() == null ? null : VietnamTime.toInstant(ticket.getResolvedAt()),
                workflowFor(ticket)
        );
    }

    private SupportWorkflowResponse workflowFor(SupportTicket ticket) {
        Booking booking = ticket.getBooking();
        String category = ticket.getCategory() == null ? "" : ticket.getCategory().toLowerCase(Locale.ROOT);
        if (booking == null) {
            return workflow(
                    "MISSING_BOOKING",
                    null,
                    "Không tìm thấy booking thuộc tài khoản từ PNR đã cung cấp.",
                    List.of("Yêu cầu khách kiểm tra lại PNR.", "Gắn đúng booking rồi đánh giá lại yêu cầu."),
                    null
            );
        }

        BookingStatus status = booking.getStatus();
        boolean moreThan24Hours = booking.getFlight() != null
                && booking.getFlight().getDepartureAt() != null
                && booking.getFlight().getDepartureAt().isAfter(VietnamTime.nowLocal().plusHours(24));

        return switch (category) {
            case "change" -> {
                if (status == BookingStatus.CONFIRMED && moreThan24Hours) {
                    yield workflow(
                            "ELIGIBLE", status.name(),
                            "Booking đã thanh toán và chuyến bay còn trên 24 giờ.",
                            List.of("Khách chọn chuyến bay thay thế.", "Admin kiểm tra chỗ và chênh lệch giá.", "Xác nhận thay đổi sau khi khách đồng ý chi phí."),
                            "SEARCH_FLIGHTS"
                    );
                }
                yield workflow(
                        "INELIGIBLE", status.name(),
                        moreThan24Hours
                                ? "Chỉ booking đã thanh toán mới đủ điều kiện yêu cầu đổi lịch."
                                : "Chuyến bay còn không quá 24 giờ nên không đủ điều kiện đổi trực tuyến.",
                        List.of("Thông báo lý do cho khách.", "Khách có thể liên hệ hotline nếu cần xem xét ngoại lệ."),
                        null
                );
            }
            case "refund" -> {
                if (status == BookingStatus.PENDING_PAYMENT) {
                    yield workflow(
                            "ELIGIBLE", status.name(),
                            "Booking chưa thanh toán nên khách có thể hủy trực tiếp.",
                            List.of("Mở lịch sử booking.", "Chọn Hủy vé và xác nhận."),
                            "OPEN_BOOKINGS"
                    );
                }
                if (status == BookingStatus.CONFIRMED && moreThan24Hours) {
                    yield workflow(
                            "MANUAL_REVIEW", status.name(),
                            "Booking đã thanh toán; cần admin kiểm tra điều kiện giá vé và phí hoàn.",
                            List.of("Kiểm tra điều kiện hạng vé.", "Tính phí hoàn/hủy.", "Gửi số tiền hoàn dự kiến để khách xác nhận."),
                            null
                    );
                }
                yield workflow(
                        "INELIGIBLE", status.name(),
                        "Trạng thái booking hoặc thời gian khởi hành không cho phép tự hoàn/hủy.",
                        List.of("Thông báo lý do cho khách.", "Chuyển hotline nếu cần xem xét ngoại lệ."),
                        null
                );
            }
            case "payment" -> {
                if (status == BookingStatus.PENDING_PAYMENT) {
                    yield workflow(
                            "ELIGIBLE", status.name(),
                            "Booking đang chờ thanh toán.",
                            List.of("Mở lịch sử booking.", "Chọn Thanh toán và hoàn tất giao dịch.", "Tải lại nếu trạng thái chưa cập nhật."),
                            "OPEN_BOOKINGS"
                    );
                }
                yield workflow(
                        "INELIGIBLE", status.name(),
                        status == BookingStatus.CONFIRMED
                                ? "Booking đã được thanh toán thành công."
                                : "Booking không còn ở trạng thái chờ thanh toán.",
                        List.of("Kiểm tra trạng thái booking hiển thị cho khách.", "Đối soát thủ công nếu khách báo đã bị trừ tiền."),
                        null
                );
            }
            case "baggage" -> {
                if (status == BookingStatus.PENDING_PAYMENT) {
                    yield workflow(
                            "ELIGIBLE", status.name(),
                            "Booking chưa thanh toán nên còn có thể cập nhật hành lý trong app.",
                            List.of("Mở Tiện ích Hành lý.", "Chọn gói kg và booking.", "Xác nhận trước khi thanh toán."),
                            "OPEN_BAGGAGE"
                    );
                }
                if (status == BookingStatus.CONFIRMED && moreThan24Hours) {
                    yield workflow(
                            "MANUAL_REVIEW", status.name(),
                            "Booking đã thanh toán; admin cần kiểm tra khả năng mua thêm với hãng.",
                            List.of("Kiểm tra hạn mức hành lý hiện tại.", "Báo phí mua thêm.", "Cập nhật booking sau khi khách xác nhận."),
                            null
                    );
                }
                yield workflow(
                        "INELIGIBLE", status.name(),
                        "Trạng thái booking hoặc thời gian khởi hành không cho phép mua thêm hành lý trực tuyến.",
                        List.of("Thông báo lý do cho khách.", "Hướng dẫn hỏi tại quầy nếu chuyến bay sắp khởi hành."),
                        null
                );
            }
            default -> workflow(
                    "MANUAL_REVIEW", status.name(),
                    "Nhóm hỗ trợ chưa có quy tắc tự động.",
                    List.of("Admin đọc nội dung và xử lý thủ công."),
                    null
            );
        };
    }

    private static SupportWorkflowResponse workflow(
            String decision,
            String bookingStatus,
            String reason,
            List<String> steps,
            String customerAction
    ) {
        String prefix = switch (decision) {
            case "ELIGIBLE" -> "Yêu cầu của bạn đủ điều kiện xử lý. ";
            case "INELIGIBLE" -> "Yêu cầu hiện chưa đủ điều kiện xử lý. ";
            case "MISSING_BOOKING" -> "Chúng tôi chưa xác định được booking liên quan. ";
            default -> "Yêu cầu cần được kiểm tra thủ công. ";
        };
        String suggestedReply = prefix + reason + "\n\nCác bước tiếp theo:\n- " + String.join("\n- ", steps);
        return new SupportWorkflowResponse(decision, bookingStatus, reason, steps, customerAction, suggestedReply);
    }

    private static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private static String cleanRequired(String value) {
        String cleaned = clean(value);
        if (cleaned == null) {
            throw new IllegalArgumentException("Value is required");
        }
        return cleaned;
    }
}
