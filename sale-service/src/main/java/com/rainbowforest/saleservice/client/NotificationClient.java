package com.rainbowforest.saleservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "notification-service")
public interface NotificationClient {
    @PostMapping("/send")
    void sendNotification(@RequestBody Map<String, Object> request);
}
