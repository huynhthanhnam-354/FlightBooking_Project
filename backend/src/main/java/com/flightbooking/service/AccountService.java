package com.flightbooking.service;

import com.flightbooking.model.AppUser;
import com.flightbooking.repository.AppUserRepository;
import com.flightbooking.web.dto.ChangePasswordRequest;
import com.flightbooking.web.dto.MeResponse;
import com.flightbooking.web.dto.PrivacyUpdateRequest;
import com.flightbooking.web.dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public MeResponse getMe(String email) {
        return toMe(requireUser(email));
    }

    @Transactional
    public MeResponse updateProfile(String email, UpdateProfileRequest request) {
        AppUser user = requireUser(email);
        user.setFullName(request.fullName().trim());
        String p = request.phone();
        user.setPhone(p == null || p.isBlank() ? null : p.trim());
        return toMe(user);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        AppUser user = requireUser(email);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    @Transactional
    public MeResponse updatePrivacy(String email, PrivacyUpdateRequest request) {
        AppUser user = requireUser(email);
        user.setShareAnalytics(request.shareAnalytics());
        user.setMarketingOptIn(request.marketingOptIn());
        return toMe(user);
    }

    private AppUser requireUser(String email) {
        return appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private static MeResponse toMe(AppUser user) {
        return new MeResponse(
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole().name(),
                user.isShareAnalytics(),
                user.isMarketingOptIn()
        );
    }
}
