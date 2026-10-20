package com.rainbowforest.cartservice.feignclient;

import com.rainbowforest.cartservice.domain.Product;
import com.rainbowforest.cartservice.domain.ProductVariantInfo;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-catalog-service", url = "${product.catalog.service.url:http://localhost:8810/}")
public interface ProductClient {

    @GetMapping(value = "/products/{id}")
    Product getProductById(@PathVariable(value = "id") Long productId);

    @GetMapping(value = "/product-variants/{variantId}")
    ProductVariantInfo getVariantById(@PathVariable(value = "variantId") Long variantId);

    @GetMapping(value = "/products/batch")
    java.util.List<Product> getProductsBatch(@org.springframework.web.bind.annotation.RequestParam(value = "ids") java.util.List<Long> ids);
}
