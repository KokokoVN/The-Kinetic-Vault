package com.rainbowforest.reviewservice.feign;

import com.rainbowforest.reviewservice.dto.OrderDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "order-service")
public interface OrderClient {
    @GetMapping("/orders/{id}/review-check")
    OrderDto getOrderById(@PathVariable("id") Long id);
}
