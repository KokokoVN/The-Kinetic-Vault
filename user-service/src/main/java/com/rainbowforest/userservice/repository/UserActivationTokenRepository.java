package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.UserActivationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserActivationTokenRepository extends JpaRepository<UserActivationToken, Long> {
    Optional<UserActivationToken> findByToken(String token);
    Optional<UserActivationToken> findTop1ByUser_IdAndOtpCodeAndUsedAtIsNullOrderByIdDesc(Long userId, String otpCode);
    void deleteAllByUser_Id(Long userId);
    List<UserActivationToken> findTop200ByUsedAtIsNullAndExpiresAtBefore(LocalDateTime now);
}

