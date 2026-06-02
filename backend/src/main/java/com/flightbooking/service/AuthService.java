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
        String email = InputValidator.requireEmail(request.email());
        InputValidator.requireStrongPassword(request.password());
        String fullName = InputValidator.requirePersonName(request.fullName());
        String phone = InputValidator.optionalPhone(request.phone());
        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        AppUser user = AppUser.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(fullName)
                .phone(phone)
                .role(Role.USER)
                .build();
        appUserRepository.save(user);

        UserDetails details = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();

        String accessToken = jwtService.generateToken(details);
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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.password()
                )
        );
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        AppUser user = appUserRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow();

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
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.refreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(com.flightbooking.model.RefreshToken::getUser)
                .map(user -> {
                    UserDetails details = org.springframework.security.core.userdetails.User.builder()
                            .username(user.getEmail())
                            .password(user.getPasswordHash())
                            .roles(user.getRole().name())
                            .build();
                    String token = jwtService.generateToken(details);
                    return TokenRefreshResponse.of(token, requestRefreshToken);
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    public void requestPasswordReset(ForgotPasswordRequest request) {
        String email = InputValidator.requireEmail(request.email());
        appUserRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
        });
    }
}
