package com.rainbowforest.telegramservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;

@FeignClient(name = "order-service")
public interface OrderClient {
    @GetMapping("/orders/page")
    JsonNode getOrders(@RequestParam("page") int page, @RequestParam("size") int size);

    @PostMapping("/orders/{id}/status")
    JsonNode updateOrderStatus(@PathVariable("id") Long id, @RequestBody Map<String, Object> req);
}
