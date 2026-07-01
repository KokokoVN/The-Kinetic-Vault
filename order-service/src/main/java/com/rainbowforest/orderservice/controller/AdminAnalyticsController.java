package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/admin/analytics")
public class AdminAnalyticsController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/revenue-trends")
    public ResponseEntity<List<Map<String, Object>>> getRevenueTrends(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        List<Object[]> results;
        if (startDate != null && endDate != null) {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            results = orderRepository.findRevenueTrendsBetweenDates(start, end);
        } else {
            LocalDate defaultStart = LocalDate.now().minusDays(6);
            results = orderRepository.findRevenueTrendsByDateAfter(defaultStart);
        }

        List<Map<String, Object>> response = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0]);
            map.put("revenue", row[1]);
            response.add(map);
        }

        return ResponseEntity.ok(response);
    }
}
