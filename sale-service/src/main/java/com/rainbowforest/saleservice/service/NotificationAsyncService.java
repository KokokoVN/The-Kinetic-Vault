package com.rainbowforest.saleservice.service;

import com.rainbowforest.saleservice.client.NotificationClient;
import com.rainbowforest.saleservice.client.UserClient;
import com.rainbowforest.saleservice.entity.SaleProgram;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationAsyncService {

    private final UserClient userClient;
    private final NotificationClient notificationClient;

    public NotificationAsyncService(UserClient userClient, NotificationClient notificationClient) {
        this.userClient = userClient;
        this.notificationClient = notificationClient;
    }

    @Async
    public void sendPromotionEmails(SaleProgram program) {
        try {
            List<Map<String, Object>> users = userClient.getAllUsers();
            if (users == null || users.isEmpty()) return;

            for (Map<String, Object> user : users) {
                String email = (String) user.get("email");
                if (email == null || email.trim().isEmpty()) {
                    email = (String) user.get("userName");
                }
                if (email != null && email.contains("@")) {
                    Map<String, Object> notificationReq = new HashMap<>();
                    notificationReq.put("channel", "EMAIL");
                    notificationReq.put("recipient", email);
                    notificationReq.put("subject", "🎉 Khuyến mãi mới: " + program.getName());
                    
                    String body = "Xin chào,\n\n" +
                                  "Chúng tôi vừa ra mắt chương trình khuyến mãi mới: " + program.getName() + "\n" +
                                  "Chi tiết: " + program.getDescription() + "\n\n" +
                                  "Đừng bỏ lỡ cơ hội săn sale tuyệt vời này!\n\n" +
                                  "Trân trọng,\nĐội ngũ VIP PRO";
                    
                    notificationReq.put("body", body);

                    try {
                        notificationClient.sendNotification(notificationReq);
                    } catch (Exception e) {
                        System.err.println("Failed to send promo email to " + email + ": " + e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching users for promo email: " + e.getMessage());
        }
    }
}
