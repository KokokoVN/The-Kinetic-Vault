package com.rainbowforest.saleservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;
import java.util.Map;

@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/users")
    List<Map<String, Object>> getAllUsers();
}
