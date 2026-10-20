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
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/internal/telegram/orders")
public class TelegramOrderNotificationController {
    private static final Logger log = LoggerFactory.getLogger(TelegramOrderNotificationController.class);

    @Autowired
    private AdminTelegramBot bot;

    @Autowired
    private TelegramUserRepository userRepository;

    @PostMapping("/notify-new")
    public ResponseEntity<Void> notifyNewOrder(@RequestBody Map<String, Object> orderDetails) {
        Long orderId = null;
        if (orderDetails.get("orderId") != null) {
            orderId = Long.valueOf(orderDetails.get("orderId").toString());
        }
        String orderNumber = (String) orderDetails.get("orderNumber");
        String total = (String) orderDetails.get("total");
        String paymentMethod = (String) orderDetails.get("paymentMethod");
        Integer itemCount = (Integer) orderDetails.get("itemCount");

        String userName = (String) orderDetails.get("userName");
        String shippingAddress = (String) orderDetails.get("shippingAddress");
        String phoneLast4 = (String) orderDetails.get("phoneLast4");
        String itemsDetail = (String) orderDetails.get("itemsDetail");

        String messageText = "🚨 **CÓ ĐƠN HÀNG MỚI** 🚨\n\n" +
                "📦 **Mã đơn:** " + (orderNumber != null ? orderNumber : orderId) + "\n" +
                "👤 **Khách hàng:** " + (userName != null ? userName : "N/A") + "\n" +
                "📞 **SĐT:** " + (phoneLast4 != null ? phoneLast4 : "N/A") + "\n" +
                "🏠 **Địa chỉ:** " + (shippingAddress != null ? shippingAddress : "N/A") + "\n" +
                "💰 **Tổng tiền:** " + (total != null ? total : "N/A") + " đ\n" +
                "💳 **Thanh toán:** " + (paymentMethod != null ? paymentMethod : "N/A") + "\n" +
                "🛍 **Số lượng SP:** " + (itemCount != null ? itemCount : 0) + "\n";
                
        if (itemsDetail != null && !itemsDetail.isEmpty()) {
            messageText += "\n📝 **Chi tiết sản phẩm:**\n" + itemsDetail;
        }

        messageText += "\nVui lòng xác nhận đơn hàng này.";

        InlineKeyboardMarkup markupInline = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> rowsInline = new ArrayList<>();
        List<InlineKeyboardButton> rowInline = new ArrayList<>();
        
        InlineKeyboardButton btn = new InlineKeyboardButton();
        btn.setText("✅ Xác nhận đơn hàng");
        btn.setCallbackData("CONFIRM_ORDER_" + orderId);
        rowInline.add(btn);
        rowsInline.add(rowInline);
        markupInline.setKeyboard(rowsInline);

        List<TelegramUser> admins = userRepository.findAll();
        log.info("Found {} telegram users to notify", admins.size());
        for (TelegramUser admin : admins) {
            String role = admin.getRole();
            log.info("Checking user: {} with role: {}", admin.getChatId(), role);
            if (role != null && (role.toUpperCase().contains("ADMIN") || role.toUpperCase().contains("MANAGER"))) {
                SendMessage msg = new SendMessage();
                msg.setChatId(admin.getChatId().toString());
                msg.setText(messageText);
                msg.setReplyMarkup(markupInline);
                try {
                    bot.execute(msg);
                } catch (Exception e) {
                    log.error("Failed to send order notification to Telegram user {}: {}", admin.getChatId(), e.getMessage());
                }
            }
        }
        return ResponseEntity.ok().build();
    }
}
