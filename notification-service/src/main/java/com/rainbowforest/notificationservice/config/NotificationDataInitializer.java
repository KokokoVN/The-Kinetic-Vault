package com.rainbowforest.notificationservice.config;

import com.rainbowforest.notificationservice.entity.NotificationMessage;
import com.rainbowforest.notificationservice.repository.NotificationMessageRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class NotificationDataInitializer implements CommandLineRunner {

    private final NotificationMessageRepository notificationMessageRepository;

    public NotificationDataInitializer(NotificationMessageRepository notificationMessageRepository) {
        this.notificationMessageRepository = notificationMessageRepository;
    }

    @Override
    public void run(String... args) {
        if (notificationMessageRepository.count() > 0) {
            return;
        }

        save("EMAIL", "alice@kinetic.dev", "Xac nhan don hang", "Don hang ORD-DEMO-0001 da duoc tao", "SENT");
        save("SMS", "0900000001", "Cap nhat giao hang", "Don hang ORD-DEMO-0003 dang duoc giao", "SENT");
        save("PUSH", "user:bob", "Khuyen mai moi", "Co ma giam gia 20% cho ban", "SENT");
        save("EMAIL", "charlie@kinetic.dev", "Thanh toan that bai", "Don hang ORD-DEMO-0005 thanh toan that bai", "FAILED");
    }

    private void save(String channel, String recipient, String subject, String body, String status) {
        NotificationMessage n = new NotificationMessage();
        n.setChannel(channel);
        n.setRecipient(recipient);
        n.setSubject(subject);
        n.setBody(body);
        n.setStatus(status);
        notificationMessageRepository.save(n);
    }
}
