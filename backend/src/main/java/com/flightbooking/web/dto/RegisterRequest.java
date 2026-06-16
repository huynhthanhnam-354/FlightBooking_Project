package com.flightbooking.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for User Registration.
 * Define it as a clean Java Record matching the fields used in AuthService.
 */
public record RegisterRequest(
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        String email,

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 8, message = "Mật khẩu phải từ 8 ký tự trở lên")
        String password,

        @NotBlank(message = "Họ và tên không được để trống")
        String fullName,

        @Size(max = 32)
        String phone,

        Boolean shareAnalytics,
        Boolean marketingOptIn
) {
}
