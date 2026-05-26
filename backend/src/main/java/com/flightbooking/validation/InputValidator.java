package com.flightbooking.validation;

import java.util.Locale;
import java.util.regex.Pattern;

public final class InputValidator {

    private static final Pattern GMAIL = Pattern.compile(
            "^[A-Z0-9](?:[A-Z0-9._%+-]{0,62}[A-Z0-9])?@gmail\\.com$",
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
        if (raw == null) {
            throw new IllegalArgumentException("Invalid email address");
        }
        String email = raw.trim().toLowerCase(Locale.ROOT);
        if (!GMAIL.matcher(email).matches() || email.contains("..")) {
            throw new IllegalArgumentException("Invalid email address");
        }
        return email;
    }

    public static String requirePersonName(String raw) {
        if (raw == null) {
            throw new IllegalArgumentException("Invalid full name");
        }
        String name = raw.trim().replaceAll("\\s+", " ");
        if (!PERSON_NAME.matcher(name).matches()
                || UNSAFE_NAME.matcher(name).find()) {
            throw new IllegalArgumentException("Invalid full name");
        }
        return name;
    }

    public static String optionalPhone(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String phone = raw.trim().replace(" ", "");
        if (!PHONE.matcher(phone).matches()) {
            throw new IllegalArgumentException("Invalid phone number");
        }
        return phone;
    }

    public static String optionalIdCard(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String id = raw.trim().toUpperCase(Locale.ROOT).replace(" ", "");
        if (!ID_CARD.matcher(id).matches()) {
            throw new IllegalArgumentException("Invalid ID or passport number");
        }
        return id;
    }

    public static void requireStrongPassword(String raw) {
        if (raw == null || !STRONG_PASSWORD.matcher(raw).matches()) {
            throw new IllegalArgumentException("Password must be 8-100 characters and include uppercase, lowercase, and a number");
        }
    }
}
