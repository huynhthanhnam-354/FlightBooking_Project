package com.flightbooking.startup;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.Role;
import com.flightbooking.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Tạo tài khoản admin mặc định lần đầu chạy app (nếu chưa có trong DB).
 */
@Component
@RequiredArgsConstructor
public class AdminUserLoader implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String email = "admin@skybook.local";
        AppUser user = appUserRepository.findByEmailIgnoreCase(email).orElse(new AppUser());
        
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("Admin123!"));
        user.setFullName("SkyBook Admin");
        user.setRole(Role.ADMIN);
        
        appUserRepository.save(user);
    }
}
