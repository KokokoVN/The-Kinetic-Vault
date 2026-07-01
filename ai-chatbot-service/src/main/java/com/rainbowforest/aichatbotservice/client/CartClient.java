package com.rainbowforest.aichatbotservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(
        name = "cart-service",
        url = "${cart.service.url:http://localhost:8811}"
)
public interface CartClient {
    @GetMapping("/cart/items")
    java.util.Map<String, Object> getCartItems(@RequestHeader(value = "Cookie", required = false) String cartId);
}
