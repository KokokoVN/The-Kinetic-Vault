package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "telegram-service", url = "http://localhost:8092/")
public interface TelegramClient {

    @PostMapping("/internal/telegram/orders/notify-new")
    void notifyNewOrder(@RequestBody Map<String, Object> orderDetails);
}
