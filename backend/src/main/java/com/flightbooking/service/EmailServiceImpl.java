package com.flightbooking.service;

import com.flightbooking.dto.BookingDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("HH:mm, dd/MM/yyyy");

    @Override
    @Async("emailExecutor") // Thực thi bất đồng bộ trên thread pool đã cấu hình
    public void sendBookingSuccessEmail(BookingDTO booking, String qrCodeBase64) {
        log.info("Bắt đầu chuẩn bị email gửi tới: {} cho mã đặt chỗ: {}", booking.getCustomerEmail(), booking.getBookingCode());
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // Sử dụng UTF-8 để hỗ trợ Tiếng Việt
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(booking.getCustomerEmail());
            helper.setSubject("[FlightBooking] Xác nhận đặt vé thành công - " + booking.getBookingCode());

            String htmlContent = buildHtmlContent(booking, qrCodeBase64);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email đã được gửi thành công tới: {}", booking.getCustomerEmail());

        } catch (MessagingException e) {
            log.error("Lỗi cấu trúc MimeMessage khi gửi email tới {}: {}", booking.getCustomerEmail(), e.getMessage());
        } catch (MailException e) {
            log.error("Lỗi hệ thống SMTP khi gửi email tới {}: {}", booking.getCustomerEmail(), e.getMessage());
        } catch (Exception e) {
            log.error("Lỗi không xác định khi gửi email: {}", e.getMessage());
        }
    }

    @Override
    @Async("emailExecutor")
    public void sendBookingCancellationEmail(BookingDTO booking) {
        log.info("Bắt đầu chuẩn bị email hủy vé gửi tới: {}", booking.getCustomerEmail());
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(booking.getCustomerEmail());
            helper.setSubject("[FlightBooking] Thông báo hủy vé thành công - " + booking.getBookingCode());

            String htmlContent = buildCancellationHtmlContent(booking);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email hủy vé đã được gửi tới: {}", booking.getCustomerEmail());
        } catch (Exception e) {
            log.error("Lỗi khi gửi email hủy vé: {}", e.getMessage());
        }
    }

    private String buildCancellationHtmlContent(BookingDTO booking) {
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { width: 90%%; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
                .header { text-align: center; background-color: #e11d48; color: white; padding: 10px; border-radius: 8px 8px 0 0; }
                .section { margin-top: 20px; }
                .footer { margin-top: 30px; font-size: 0.8em; color: #666; text-align: center; }
                .status-badge { display: inline-block; background-color: #fef2f2; color: #991b1b; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Thông Báo Hủy Vé</h1>
                </div>
                <div class='section'>
                    <p>Chào <strong>%s</strong>,</p>
                    <p>Chúng tôi xác nhận rằng yêu cầu hủy vé cho mã đặt chỗ <strong style='color: #e11d48;'>%s</strong> của bạn đã được thực hiện thành công.</p>
                    <div class='status-badge'>TRẠNG THÁI: ĐÃ HỦY</div>
                </div>
                
                <div class='section'>
                    <h3>Thông tin vé đã hủy</h3>
                    <p>
                        Số hiệu chuyến bay: <strong>%s</strong><br/>
                        Chặng bay: %s &rarr; %s<br/>
                        Thời gian dự kiến: %s
                    </p>
                </div>

                <div class='section'>
                    <p>Số tiền thanh toán (nếu có) sẽ được xử lý hoàn trả theo chính sách của chúng tôi. Quá trình này có thể mất từ 3-7 ngày làm việc tùy thuộc vào ngân hàng của bạn.</p>
                    <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ tổng đài hỗ trợ 1900-XXXX.</p>
                </div>

                <div class='footer'>
                    <p>Cảm ơn bạn đã sử dụng dịch vụ.<br/>
                    &copy; 2024 FlightBooking System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """.formatted(
            booking.getCustomerName(),
            booking.getBookingCode(),
            booking.getFlightCode(),
            booking.getDepartureCity(),
            booking.getArrivalCity(),
            booking.getDepartureTime().format(DATE_FORMATTER)
        );
    }

    /**
     * Xây dựng template HTML động cho Email.
     */
    private String buildHtmlContent(BookingDTO booking, String qrCodeBase64) {
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { width: 90%%; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
                .header { text-align: center; background-color: #0284c7; color: white; padding: 10px; border-radius: 8px 8px 0 0; }
                .section { margin-top: 20px; }
                .table { width: 100%%; border-collapse: collapse; margin-top: 10px; }
                .table th, .table td { border-bottom: 1px solid #eee; padding: 10px; text-align: left; }
                .total { font-weight: bold; color: #0284c7; font-size: 1.2em; }
                .qr-section { text-align: center; margin-top: 30px; background: #f9fafb; padding: 15px; border-radius: 8px; }
                .qr-image { width: 200px; height: 200px; }
                .footer { margin-top: 30px; font-size: 0.8em; color: #666; text-align: center; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Xác Nhận Vé Máy Bay</h1>
                </div>
                <div class='section'>
                    <p>Chào <strong>%s</strong>,</p>
                    <p>Cảm ơn bạn đã tin tưởng lựa chọn dịch vụ của chúng tôi. Yêu cầu đặt vé của bạn đã được xác nhận thành công.</p>
                </div>
                
                <div class='section'>
                    <h3>Thông tin chuyến bay</h3>
                    <table class='table'>
                        <tr><td>Mã đặt chỗ:</td><td><strong>%s</strong></td></tr>
                        <tr><td>Số hiệu chuyến bay:</td><td>%s</td></tr>
                        <tr><td>Chặng bay:</td><td>%s &rarr; %s</td></tr>
                        <tr><td>Khởi hành:</td><td>%s</td></tr>
                        <tr><td>Vị trí ghế:</td><td><strong>%s</strong></td></tr>
                    </table>
                </div>

                <div class='section'>
                    <h3>Chi tiết thanh toán</h3>
                    <table class='table'>
                        <tr><td>Giá vé:</td><td>%s VNĐ</td></tr>
                        <tr><td>Thuế & Phí:</td><td>%s VNĐ</td></tr>
                        <tr class='total'><td>Tổng cộng:</td><td>%s VNĐ</td></tr>
                    </table>
                </div>

                <div class='qr-section'>
                    <p>Mã QR Code Check-in</p>
                    <img src='data:image/png;base64,%s' alt='Mã QR Check-in' class='qr-image' />
                    <p style='font-size: 0.8em;'>Vui lòng trình mã này tại quầy thủ tục hoặc cổng an ninh.</p>
                </div>

                <div class='footer'>
                    <p>Đây là email tự động, vui lòng không trả lời.<br/>
                    &copy; 2024 FlightBooking System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """.formatted(
            booking.getCustomerName(),
            booking.getBookingCode(),
            booking.getFlightCode(),
            booking.getDepartureCity(),
            booking.getArrivalCity(),
            booking.getDepartureTime().format(DATE_FORMATTER),
            booking.getSeatNumber(),
            String.format("%,.0f", booking.getBasePrice()),
            String.format("%,.0f", booking.getTaxAmount()),
            String.format("%,.0f", booking.getTotalPrice()),
            qrCodeBase64
        );
    }
}
