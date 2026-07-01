package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/admin/analytics")
public class AdminAnalyticsController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/new-customers")
    public ResponseEntity<Map<String, Object>> getNewCustomers(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        long count;
        if (startDate != null && endDate != null) {
            LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
            LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
            count = userRepository.countByCreatedAtBetween(start, end);
        } else {
            LocalDateTime defaultStart = LocalDateTime.now().minusDays(7);
            count = userRepository.countByCreatedAtAfter(defaultStart);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("newCustomers", count);
        
        return ResponseEntity.ok(response);
    }
}
