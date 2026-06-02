package com.flightbooking.service;

import com.flightbooking.dto.BookingDTO;

/**
 * Service interface for Email operations.
 */
public interface EmailService {
    
    /**
     * Gửi email xác nhận đặt vé thành công kèm mã QR Code.
     * @param booking Đối tượng chứa thông tin đặt vé và hóa đơn.
     * @param qrCodeBase64 Chuỗi Base64 của ảnh QR Code.
     */
    void sendBookingSuccessEmail(BookingDTO booking, String qrCodeBase64);

    /**
     * Gửi email thông báo hủy vé thành công.
     * @param booking Đối tượng chứa thông tin đặt vé đã hủy.
     */
    void sendBookingCancellationEmail(BookingDTO booking);
}
