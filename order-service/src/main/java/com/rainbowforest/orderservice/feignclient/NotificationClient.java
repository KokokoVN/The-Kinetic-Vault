package com.rainbowforest.orderservice.feignclient;

import com.rainbowforest.orderservice.dto.SendNotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", url = "http://localhost:8815/")
public interface NotificationClient {
    @PostMapping("/send")
    Object send(@RequestBody SendNotificationRequest request);
}

