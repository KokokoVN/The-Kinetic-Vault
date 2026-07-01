package com.rainbowforest.telegramservice.controller;

import com.rainbowforest.telegramservice.bot.AdminTelegramBot;
import com.rainbowforest.telegramservice.entity.TelegramUser;
import com.rainbowforest.telegramservice.repository.TelegramUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/internal/telegram/inventory")
public class TelegramInventoryNotificationController {

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

        String messageText = "⚠️ **CẢNH BÁO TỒN KHO THẤP** ⚠️\n\n" +
                "📦 **Sản phẩm:** " + (productName != null ? productName : "ID: " + productId) + "\n" +
                (variantId != null ? "🔖 **Biến thể ID:** " + variantId + "\n" : "") +
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
                    System.err.println("Failed to send low stock notification to Telegram user: " + admin.getChatId());
                }
            }
        }
        return ResponseEntity.ok().build();
    }
}
