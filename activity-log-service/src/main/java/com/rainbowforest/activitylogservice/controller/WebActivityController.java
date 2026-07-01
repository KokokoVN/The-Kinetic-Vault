package com.rainbowforest.activitylogservice.controller;

import com.rainbowforest.activitylogservice.dto.DeleteWebActivitiesRequest;
import com.rainbowforest.activitylogservice.dto.WebActivityRequest;
import com.rainbowforest.activitylogservice.entity.WebActivity;
import com.rainbowforest.activitylogservice.service.WebActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
public class WebActivityController {

    private final WebActivityService webActivityService;

    public WebActivityController(WebActivityService webActivityService) {
        this.webActivityService = webActivityService;
    }

    @PostMapping("/log")
    public ResponseEntity<WebActivity> log(@Valid @RequestBody WebActivityRequest request) {
        WebActivity saved = webActivityService.log(request);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /** Đặt trước <code>/{id}</code> để tránh nhầm {@code recent} thành id. */
    @GetMapping("/recent")
    public ResponseEntity<List<WebActivity>> recent(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(webActivityService.recent(limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebActivity> get(@PathVariable Long id) {
        return webActivityService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> deleteBatch(@RequestBody(required = false) DeleteWebActivitiesRequest request) {
        List<Long> ids = request == null || request.getIds() == null ? Collections.emptyList() : request.getIds();
        int deleted = webActivityService.deleteByIds(ids);
        return ResponseEntity.ok(Collections.<String, Object>singletonMap("deleted", deleted));
    }
}
