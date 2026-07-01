package com.rainbowforest.telegramservice.repository;

import com.rainbowforest.telegramservice.entity.TelegramToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TelegramTokenRepository extends JpaRepository<TelegramToken, Long> {
    Optional<TelegramToken> findByToken(String token);
}
