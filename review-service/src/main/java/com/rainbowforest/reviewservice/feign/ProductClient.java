package com.rainbowforest.reviewservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service")
public interface ProductClient {
    // We can add methods to fetch product details if needed for UI aggregation.
    // For backend validation, checking the order is usually enough since the order contains the valid product/variant IDs.
}
