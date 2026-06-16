package com.flightbooking.service;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.Role;
import com.flightbooking.repository.AppUserRepository;
import com.flightbooking.security.JwtService;
import com.flightbooking.validation.InputValidator;
import com.flightbooking.web.dto.AuthResponse;
import com.flightbooking.web.dto.ForgotPasswordRequest;
import com.flightbooking.web.dto.LoginRequest;
import com.flightbooking.web.dto.RegisterRequest;
import com.flightbooking.web.dto.TokenRefreshRequest;
import com.flightbooking.web.dto.TokenRefreshResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Use requireEmail to validate and normalize
        String email = InputValidator.requireEmail(request.email());
        InputValidator.requireStrongPassword(request.password());
        String fullName = InputValidator.requirePersonName(request.fullName());
        
        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email này đã được sử dụng bởi một tài khoản khác.");
        }

        AppUser user = AppUser.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(fullName)
                .phone(InputValidator.optionalPhone(request.phone()))
                .role(Role.USER)
                .shareAnalytics(request.shareAnalytics() != null && request.shareAnalytics())
                .marketingOptIn(request.marketingOptIn() != null && request.marketingOptIn())
                .build();

        appUserRepository.save(user);

        // Standard UserDetails for consistent handling
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities("ROLE_USER")
                .build();

        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(user.getId()).getToken();

        return AuthResponse.of(
                accessToken,
                refreshToken,
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getPhone(),
                user.isShareAnalytics(),
                user.isMarketingOptIn()
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = InputValidator.requireEmail(request.email());
        
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password())
            );
        } catch (Exception e) {
            throw new IllegalArgumentException("Email hoặc mật khẩu không chính xác.");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        AppUser user = appUserRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Tài khoản không tồn tại."));

        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(user.getId()).getToken();

        return AuthResponse.of(
                accessToken,
                refreshToken,
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getPhone(),
                user.isShareAnalytics(),
                user.isMarketingOptIn()
        );
    }

    public void requestPasswordReset(ForgotPasswordRequest request) {
        String email = InputValidator.requireEmail(request.email());
        appUserRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            // Future logic for password reset
        });
    }

    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        return refreshTokenService.refreshAccessToken(request.refreshToken());
    }
}
