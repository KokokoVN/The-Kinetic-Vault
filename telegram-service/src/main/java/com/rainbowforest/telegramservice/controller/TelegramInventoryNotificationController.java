package com.rainbowforest.telegramservice.controller;

import com.rainbowforest.telegramservice.bot.AdminTelegramBot;
import com.rainbowforest.telegramservice.entity.TelegramUser;
import com.rainbowforest.telegramservice.repository.TelegramUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/internal/telegram/inventory")
public class TelegramInventoryNotificationController {
    private static final Logger log = LoggerFactory.getLogger(TelegramInventoryNotificationController.class);

    @Autowired
    private AdminTelegramBot bot;

    @Autowired
    private TelegramUserRepository userRepository;

    @PostMapping("/low-stock")
    public ResponseEntity<Void> notifyLowStock(@RequestBody Map<String, Object> details) {
        Long productId = details.get("productId") != null ? Long.valueOf(details.get("productId").toString()) : null;
        Long variantId = details.get("variantId") != null ? Long.valueOf(details.get("variantId").toString()) : null;
        String productName = (String) details.get("productName");
        Integer quantityOnHand = details.get("quantityOnHand") != null ? Integer.valueOf(details.get("quantityOnHand").toString()) : 0;
        String variantName = details.get("variantName") != null ? details.get("variantName").toString().trim() : null;
        String variantLabel = details.get("variantLabel") != null ? details.get("variantLabel").toString().trim() : null;

        StringBuilder variantInfo = new StringBuilder();
        if (variantName != null && !variantName.isEmpty()) {
            variantInfo.append(variantName);
        } else if (variantLabel != null && !variantLabel.isEmpty()) {
            variantInfo.append(variantLabel);
        }
        if (variantId != null) {
            if (variantInfo.length() > 0) {
                variantInfo.append(" (ID: ").append(variantId).append(")");
            } else {
                variantInfo.append("ID: ").append(variantId);
            }
        }

        String messageText = "⚠️ **CẢNH BÁO TỒN KHO THẤP** ⚠️\n\n" +
                "📦 **Sản phẩm:** " + (productName != null ? productName : "ID: " + productId) + "\n" +
                (variantInfo.length() > 0 ? "🔖 **Biến thể:** " + variantInfo.toString() + "\n" : "") +
                "📉 **Số lượng còn lại:** " + quantityOnHand + "\n\n" +
                "Vui lòng kiểm tra và nhập thêm hàng kịp thời!";

        List<TelegramUser> admins = userRepository.findAll();
        for (TelegramUser admin : admins) {
            String role = admin.getRole();
            if (role != null && (role.toUpperCase().contains("ADMIN") || role.toUpperCase().contains("MANAGER"))) {
                SendMessage msg = new SendMessage();
                msg.setChatId(admin.getChatId().toString());
                msg.setText(messageText);
                try {
                    bot.execute(msg);
                } catch (Exception e) {
                    log.error("Failed to send low stock notification to Telegram user {}: {}", admin.getChatId(), e.getMessage());
                }
            }
        }
        return ResponseEntity.ok().build();
    }
}
