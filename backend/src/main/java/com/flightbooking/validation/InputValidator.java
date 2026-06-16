package com.flightbooking.validation;

import java.util.Locale;
import java.util.regex.Pattern;

public final class InputValidator {

    private static final Pattern EMAIL = Pattern.compile(
            "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern PHONE = Pattern.compile("^(0[0-9]{9}|\\+84[0-9]{9})$");
    private static final Pattern STRONG_PASSWORD = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,100}$");
    private static final Pattern PERSON_NAME = Pattern.compile("^[\\p{L}\\p{M}\\p{N}][\\p{L}\\p{M}\\p{N} .,'-]{1,199}$");
    private static final Pattern UNSAFE_NAME = Pattern.compile(
            "(https?://|www\\.|<script|javascript:|[\\p{Cntrl}<>\"`{}\\\\])",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern ID_CARD = Pattern.compile("^[A-Z0-9]{6,20}$", Pattern.CASE_INSENSITIVE);

    private InputValidator() {
    }

    public static String requireEmail(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Email không được để trống.");
        }
        String email = raw.trim().toLowerCase(Locale.ROOT);
        if (!EMAIL.matcher(email).matches()) {
            throw new IllegalArgumentException("Định dạng Email không hợp lệ.");
        }
        return email;
    }

    public static String requirePersonName(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Họ và tên không được để trống.");
        }
        String name = raw.trim().replaceAll("\\s+", " ");
        if (!PERSON_NAME.matcher(name).matches() || UNSAFE_NAME.matcher(name).find()) {
            throw new IllegalArgumentException("Họ và tên không hợp lệ.");
        }
        return name;
    }

    public static String optionalPhone(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String phone = raw.trim().replace(" ", "");
        if (!PHONE.matcher(phone).matches()) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ.");
        }
        return phone;
    }

    public static String optionalIdCard(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String id = raw.trim().toUpperCase(Locale.ROOT).replace(" ", "");
        if (!ID_CARD.matcher(id).matches()) {
            throw new IllegalArgumentException("Số CCCD hoặc hộ chiếu không hợp lệ.");
        }
        return id;
    }

    public static void requireStrongPassword(String raw) {
        if (raw == null || !STRONG_PASSWORD.matcher(raw).matches()) {
            throw new IllegalArgumentException("Mật khẩu phải từ 8-100 ký tự, bao gồm chữ hoa, chữ thường và chữ số.");
        }
    }
}
