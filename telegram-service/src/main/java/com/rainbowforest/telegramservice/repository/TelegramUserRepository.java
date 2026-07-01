package com.rainbowforest.telegramservice.repository;

import com.rainbowforest.telegramservice.entity.TelegramUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TelegramUserRepository extends JpaRepository<TelegramUser, Long> {
    Optional<TelegramUser> findByChatId(Long chatId);
    Optional<TelegramUser> findBySystemUserId(Long systemUserId);
}
