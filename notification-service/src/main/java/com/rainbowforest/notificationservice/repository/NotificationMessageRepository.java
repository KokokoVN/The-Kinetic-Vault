package com.rainbowforest.notificationservice.repository;

import com.rainbowforest.notificationservice.entity.NotificationMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationMessageRepository extends JpaRepository<NotificationMessage, Long> {

    List<NotificationMessage> findByRecipientOrderByCreatedAtDesc(String recipient);

    List<NotificationMessage> findByRecipientAndChannelInOrderByCreatedAtDesc(String recipient, List<String> channels);
}
