package com.flightbooking.web;

import com.flightbooking.service.AccountService;
import com.flightbooking.web.dto.ChangePasswordRequest;
import com.flightbooking.web.dto.MeResponse;
import com.flightbooking.web.dto.PrivacyUpdateRequest;
import com.flightbooking.web.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public MeResponse getMe(Authentication authentication) {
        return accountService.getMe(authentication.getName());
    }

    @PatchMapping("/profile")
    public MeResponse updateProfile(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        return accountService.updateProfile(authentication.getName(), request);
    }

    @PostMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        accountService.changePassword(authentication.getName(), request);
    }

    @PatchMapping("/privacy")
    public MeResponse updatePrivacy(Authentication authentication, @Valid @RequestBody PrivacyUpdateRequest request) {
        return accountService.updatePrivacy(authentication.getName(), request);
    }
}
