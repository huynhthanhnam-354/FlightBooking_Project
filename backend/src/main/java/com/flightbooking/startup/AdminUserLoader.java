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
        createAdminIfMissing("admin@skybook.local", "SkyBook Admin");
        createAdminIfMissing("binhhtn@gmail.com", "Binh HTN Admin");
    }

    private void createAdminIfMissing(String email, String fullName) {
        if (!appUserRepository.existsByEmailIgnoreCase(email)) {
            AppUser admin = AppUser.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode("Admin123!"))
                    .fullName(fullName)
                    .role(Role.ADMIN)
                    .build();
            appUserRepository.save(admin);
        }
    }
}
