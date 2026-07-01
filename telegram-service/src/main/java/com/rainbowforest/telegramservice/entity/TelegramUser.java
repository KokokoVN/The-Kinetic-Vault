package com.rainbowforest.telegramservice.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "telegram_users")
@Data
public class TelegramUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long chatId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private Long systemUserId;

    @Column(nullable = false)
    private String role; // ADMIN or STAFF

    private LocalDateTime linkedAt;
}
