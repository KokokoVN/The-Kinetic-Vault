package com.rainbowforest.productcatalogservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "order-service")
public interface OrderFeignClient {

    @GetMapping("/internal/orders/check-product/{productId}")
    Boolean checkProductInOrder(@PathVariable("productId") Long productId, @RequestParam("status") String status);
}
