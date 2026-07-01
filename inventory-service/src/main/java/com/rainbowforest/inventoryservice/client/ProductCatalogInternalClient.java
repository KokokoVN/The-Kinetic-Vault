package com.rainbowforest.inventoryservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-catalog-service")
public interface ProductCatalogInternalClient {

    @PutMapping("/internal/products/{productId}/availability")
    void updateProductAvailability(@PathVariable("productId") Long productId,
                                   @RequestParam("availability") Integer availability);

    @PutMapping("/internal/product-variants/{variantId}/availability")
    void updateVariantAvailability(@PathVariable("variantId") Long variantId,
                                   @RequestParam("availability") Integer delta);

    @org.springframework.web.bind.annotation.GetMapping("/products/{id}")
    Object getProduct(@PathVariable("id") Long id);
}

