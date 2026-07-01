package com.rainbowforest.telegramservice.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "telegram_tokens")
@Data
public class TelegramToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Long systemUserId;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private LocalDateTime expiresAt;
}
