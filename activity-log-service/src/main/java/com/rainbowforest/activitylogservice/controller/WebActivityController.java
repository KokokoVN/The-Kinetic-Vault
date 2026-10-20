package com.rainbowforest.activitylogservice.controller;

import com.rainbowforest.activitylogservice.dto.DeleteWebActivitiesRequest;
import com.rainbowforest.activitylogservice.dto.WebActivityRequest;
import com.rainbowforest.activitylogservice.entity.WebActivity;
import com.rainbowforest.activitylogservice.service.WebActivityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * WebActivityController - Activity Log Service.
 *
 * Hầu hết endpoints đọc/xóa log đều nhạy cảm; yêu cầu role ADMIN hoặc INTERNAL secret.
 * Endpoint POST /log là internal-facing (từ các service khác qua gateway/internal-secret).
 */
@RestController
public class WebActivityController {

    private static final Logger log = LoggerFactory.getLogger(WebActivityController.class);

    private final WebActivityService webActivityService;

    public WebActivityController(WebActivityService webActivityService) {
        this.webActivityService = webActivityService;
    }

    /**
     * POST /log - Log một activity (internal, gọi từ các service khác qua gateway).
     * Không yêu cầu admin vì gateway đã xác thực các internal calls.
     */
    @PostMapping("/log")
    public ResponseEntity<WebActivity> log(@Valid @RequestBody WebActivityRequest request) {
        WebActivity saved = webActivityService.log(request);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /** Đặt trước <code>/{id}</code> để tránh nhầm {@code recent} thành id. */
    @GetMapping("/recent")
    public ResponseEntity<List<WebActivity>> recent(
            @RequestParam(defaultValue = "50") int limit,
            HttpServletRequest req) {
        if (!hasAdminOrInternalAccess(req)) {
            return forbidden();
        }
        // Bound limit để tránh memory pressure.
        int safeLimit = Math.max(1, Math.min(limit, 500));
        return ResponseEntity.ok(webActivityService.recent(safeLimit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebActivity> get(@PathVariable Long id, HttpServletRequest req) {
        if (!hasAdminOrInternalAccess(req)) {
            return forbidden();
        }
        return webActivityService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/search")
    public ResponseEntity<org.springframework.data.domain.Page<WebActivity>> search(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String actorUserId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            HttpServletRequest req
    ) {
        if (!hasAdminOrInternalAccess(req)) {
            return forbidden();
        }
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 200));
        return ResponseEntity.ok(webActivityService.search(action, resourceType, actorUserId, q, safePage, safeSize));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats(HttpServletRequest req) {
        if (!hasAdminOrInternalAccess(req)) {
            return forbidden();
        }
        return ResponseEntity.ok(webActivityService.stats());
    }

    @DeleteMapping("/purge")
    public ResponseEntity<Map<String, Object>> purge(
            @RequestParam(defaultValue = "30") int days,
            HttpServletRequest req) {
        if (!hasAdminOrInternalAccess(req)) {
            return forbidden();
        }
        int safeDays = Math.max(1, Math.min(days, 3650));
        int purged = webActivityService.purgeOlderThanDays(safeDays);
        return ResponseEntity.ok(Map.of("purgedCount", purged, "daysCutoff", safeDays));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WebActivity>> byUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "50") int limit,
            HttpServletRequest req) {
        if (!hasAdminOrInternalAccess(req)) {
            return forbidden();
        }
        // Sanitize userId để chống injection.
        if (userId != null && (userId.contains("..") || userId.length() > 128)) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        int safeLimit = Math.max(1, Math.min(limit, 500));
        return ResponseEntity.ok(webActivityService.findByUser(userId, safeLimit));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(defaultValue = "500") int limit,
            HttpServletRequest req) {
        if (!hasAdminOrInternalAccess(req)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        int safeLimit = Math.max(1, Math.min(limit, 5000));
        String csv = webActivityService.exportCsv(safeLimit);
        byte[] bytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "Activity_Logs.csv");
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> deleteBatch(
            @RequestBody(required = false) DeleteWebActivitiesRequest request,
            HttpServletRequest req) {
        if (!hasAdminOrInternalAccess(req)) {
            return forbidden();
        }
        List<Long> ids = request == null || request.getIds() == null ? Collections.emptyList() : request.getIds();
        // Bound số lượng IDs để chống DoS.
        if (ids.size() > 1000) {
            return ResponseEntity.badRequest().body(Collections.<String, Object>singletonMap("error", "Too many IDs (max 1000)"));
        }
        int deleted = webActivityService.deleteByIds(ids);
        return ResponseEntity.ok(Collections.<String, Object>singletonMap("deleted", deleted));
    }

    /**
     * Check quyền admin hoặc internal secret. Gateway đã xác thực JWT và forward
     * X-User-Role, X-User-Id hoặc X-Internal-Secret.
     */
    private boolean hasAdminOrInternalAccess(HttpServletRequest req) {
        String role = req.getHeader("X-User-Role");
        if ("ADMIN".equalsIgnoreCase(role)) {
            return true;
        }
        // Internal calls (gateway tới internal service) có X-Internal-Secret.
        String secret = req.getHeader("X-Internal-Secret");
        if (secret != null && !secret.trim().isEmpty()) {
            return true;
        }
        log.warn("Unauthorized activity log access from {}",
                req.getHeader("X-User-Id") != null ? req.getHeader("X-User-Id") : req.getRemoteAddr());
        return false;
    }

    private <T> ResponseEntity<T> forbidden() {
        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }
}