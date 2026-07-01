package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.rainbowforest.orderservice.domain.Product;
import com.rainbowforest.orderservice.domain.ProductVariant;

@FeignClient(name = "product-catalog-service", url = "http://localhost:8810/")
public interface ProductClient {

    @GetMapping(value = "/products/{id}")
    public Product getProductById(@PathVariable(value = "id") Long productId);

    @GetMapping(value = "/admin/products/{id}")
    Product getProductForAdminById(@PathVariable(value = "id") Long productId);

    @GetMapping(value = "/product-variants/{variantId}")
    ProductVariant getVariantById(@PathVariable(value = "variantId") Long variantId);

    @org.springframework.web.bind.annotation.PostMapping(value = "/products/{id}/sales")
    void incrementSalesCount(@PathVariable(value = "id") Long productId, @org.springframework.web.bind.annotation.RequestParam(value = "count", defaultValue = "1") Integer count);

}
