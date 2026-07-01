package com.rainbowforest.notificationservice.controller;

import com.rainbowforest.activitylog.ActivityLogPublisher;
import com.rainbowforest.notificationservice.dto.SendNotificationRequest;
import com.rainbowforest.notificationservice.entity.NotificationMessage;
import com.rainbowforest.notificationservice.service.NotificationDispatchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class NotificationController {

    private final NotificationDispatchService dispatchService;
    private final ActivityLogPublisher activityLogPublisher;

    public NotificationController(
            NotificationDispatchService dispatchService,
            ActivityLogPublisher activityLogPublisher) {
        this.dispatchService = dispatchService;
        this.activityLogPublisher = activityLogPublisher;
    }

    @PostMapping("/send")
    public ResponseEntity<NotificationMessage> send(@Valid @RequestBody SendNotificationRequest request) {
        NotificationMessage saved = dispatchService.send(request);
        Map<String, Object> after = new LinkedHashMap<>();
        after.put("messageId", saved.getId());
        after.put("channel", request.getChannel());
        after.put("recipientMasked", maskRecipient(request.getRecipient()));
        after.put("subject", request.getSubject());
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("resourceType", "NotificationMessage");
        detail.put("after", after);
        activityLogPublisher.publish(
                "notification-service",
                "NOTIFICATION_SEND",
                "NotificationMessage",
                String.valueOf(saved.getId()),
                "POST",
                "/send",
                detail,
                null,
                null);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    private static String maskRecipient(String r) {
        if (r == null || r.trim().isEmpty()) {
            return "—";
        }
        String t = r.trim();
        if (t.length() <= 4) {
            return "****";
        }
        return "****" + t.substring(t.length() - 4);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationMessage> getById(@PathVariable Long id) {
        return dispatchService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping(value = "/lookup", params = "email")
    public ResponseEntity<List<NotificationMessage>> byRecipient(@RequestParam String email) {
        List<NotificationMessage> list = dispatchService.findWebNotificationsByRecipient(email);
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationMessage> markRead(@PathVariable Long id) {
        return dispatchService.findById(id)
                .map(msg -> {
                    msg.setStatus("READ");
                    NotificationMessage saved = dispatchService.save(msg);
                    Map<String, Object> after = new LinkedHashMap<>();
                    after.put("messageId", saved.getId());
                    after.put("status", saved.getStatus());
                    after.put("subject", saved.getSubject());
                    Map<String, Object> detail = new LinkedHashMap<>();
                    detail.put("resourceType", "NotificationMessage");
                    detail.put("after", after);
                    activityLogPublisher.publish(
                            "notification-service",
                            "NOTIFICATION_MARK_READ",
                            "NotificationMessage",
                            String.valueOf(saved.getId()),
                            "PATCH",
                            "/" + id + "/read",
                            detail,
                            null,
                            null);
                    return ResponseEntity.ok(saved);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
