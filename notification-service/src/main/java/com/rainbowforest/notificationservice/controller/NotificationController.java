package com.rainbowforest.notificationservice.controller;

import com.rainbowforest.activitylog.ActivityLogPublisher;
import com.rainbowforest.notificationservice.dto.SendNotificationRequest;
import com.rainbowforest.notificationservice.entity.NotificationMessage;
import com.rainbowforest.notificationservice.service.NotificationDispatchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

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

    /**
     * GET /{id} - Lấy notification theo ID. Yêu cầu authentication & ownership check
     * (chỉ chủ sở hữu hoặc admin được xem).
     */
    @GetMapping("/{id}")
    public ResponseEntity<NotificationMessage> getById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return dispatchService.findById(id)
                .map(msg -> {
                    // IDOR protection: chỉ chủ sở hữu hoặc admin mới xem được.
                    if (!canAccess(msg, userId, role)) {
                        log.warn("IDOR attempt: user={} tried to access notification={}", userId, id);
                        return new ResponseEntity<NotificationMessage>(HttpStatus.FORBIDDEN);
                    }
                    return ResponseEntity.ok(msg);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * GET /lookup?email=... - Chỉ admin hoặc chính chủ (qua X-User-Id) mới tra cứu.
     * Tránh email enumeration và lộ notification của người khác.
     */
    @GetMapping(value = "/lookup", params = "email")
    public ResponseEntity<List<NotificationMessage>> byRecipient(
            @RequestParam String email,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        // Chỉ cho phép admin lookup; người dùng thường phải dùng /users/{id}/notifications.
        if (!"ADMIN".equalsIgnoreCase(role)) {
            log.warn("Unauthorized notification lookup attempt: user={}, email={}", userId, maskRecipient(email));
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<NotificationMessage> list = dispatchService.findWebNotificationsByRecipient(email);
        return ResponseEntity.ok(list);
    }

    /**
     * PATCH /{id}/read - Mark read. Yêu cầu ownership check.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationMessage> markRead(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return dispatchService.findById(id)
                .map(msg -> {
                    if (!canAccess(msg, userId, role)) {
                        log.warn("IDOR attempt on markRead: user={} tried notification={}", userId, id);
                        return new ResponseEntity<NotificationMessage>(HttpStatus.FORBIDDEN);
                    }
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

    /**
     * Check quyền truy cập: admin hoặc chủ sở hữu notification.
     */
    private boolean canAccess(NotificationMessage msg, String userIdHeader, String role) {
        if ("ADMIN".equalsIgnoreCase(role)) {
            return true;
        }
        if (userIdHeader == null || userIdHeader.trim().isEmpty() || msg == null) {
            return false;
        }
        String recipient = msg.getRecipient();
        if (recipient == null || recipient.trim().isEmpty()) {
            return false;
        }
        String callerUserId = userIdHeader.trim();
        return recipient.equals(callerUserId) || recipient.equalsIgnoreCase(callerUserId);
    }
}