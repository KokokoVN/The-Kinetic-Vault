package com.rainbowforest.notificationservice.service;

import com.rainbowforest.notificationservice.dto.SendNotificationRequest;
import com.rainbowforest.notificationservice.entity.NotificationMessage;

import java.util.List;
import java.util.Optional;

public interface NotificationDispatchService {

    NotificationMessage send(SendNotificationRequest request);

    Optional<NotificationMessage> findById(Long id);

    List<NotificationMessage> findByRecipient(String recipient);

    List<NotificationMessage> findWebNotificationsByRecipient(String recipient);

    NotificationMessage save(NotificationMessage message);
}
