package com.rainbowforest.inventoryservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "telegram-service")
public interface TelegramInternalClient {

    @PostMapping("/internal/telegram/inventory/low-stock")
    void notifyLowStock(@RequestBody Map<String, Object> details);
}
