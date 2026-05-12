package com.flightbooking.service;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.Role;
import com.flightbooking.repository.AppUserRepository;
import com.flightbooking.security.JwtService;
import com.flightbooking.web.dto.AuthResponse;
import com.flightbooking.web.dto.LoginRequest;
import com.flightbooking.web.dto.RegisterRequest;
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

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (appUserRepository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }
        AppUser user = AppUser.builder()
                .email(request.email().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .phone(request.phone() != null ? request.phone().trim() : null)
                .role(Role.USER)
                .build();
        appUserRepository.save(user);
        UserDetails details = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();
        String token = jwtService.generateToken(details);
        return AuthResponse.of(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getPhone(),
                user.isShareAnalytics(),
                user.isMarketingOptIn()
        );
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().trim().toLowerCase(),
                        request.password()
                )
        );
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        AppUser user = appUserRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow();
        String token = jwtService.generateToken(userDetails);
        return AuthResponse.of(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getPhone(),
                user.isShareAnalytics(),
                user.isMarketingOptIn()
        );
    }
}
