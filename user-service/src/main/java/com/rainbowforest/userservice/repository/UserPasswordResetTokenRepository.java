package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.UserPasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserPasswordResetTokenRepository extends JpaRepository<UserPasswordResetToken, Long> {
    Optional<UserPasswordResetToken> findByToken(String token);
    void deleteAllByUser_Id(Long userId);
    List<UserPasswordResetToken> findTop200ByUsedAtIsNullAndExpiresAtBefore(LocalDateTime now);
}
