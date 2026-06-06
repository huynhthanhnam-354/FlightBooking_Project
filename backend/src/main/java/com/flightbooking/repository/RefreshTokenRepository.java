package com.flightbooking.repository;

import com.flightbooking.model.AppUser;
import com.flightbooking.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUserId(Long userId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    int deleteByUser(AppUser user);
}
