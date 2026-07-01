package com.rainbowforest.telegramservice.controller;

import com.rainbowforest.telegramservice.entity.TelegramToken;
import com.rainbowforest.telegramservice.repository.TelegramTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("")
public class TelegramAuthController {

    @Autowired
    private TelegramTokenRepository tokenRepository;

    @PostMapping("/generate-token")
    public ResponseEntity<?> generateToken(@RequestHeader("X-User-Id") Long userId, @RequestHeader("X-User-Role") String role) {
        if (!"ROLE_ADMIN".equals(role) && !"ROLE_STAFF".equals(role)) {
            return ResponseEntity.status(403).body("Only Admin and Staff can link Telegram accounts.");
        }

        String tokenString = UUID.randomUUID().toString().substring(0, 8); // Short token for manual entry
        
        TelegramToken token = new TelegramToken();
        token.setToken(tokenString);
        token.setSystemUserId(userId);
        token.setRole(role);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(10)); // 10 minutes expiry

        tokenRepository.save(token);

        return ResponseEntity.ok("{\"token\": \"" + tokenString + "\"}");
    }
}
