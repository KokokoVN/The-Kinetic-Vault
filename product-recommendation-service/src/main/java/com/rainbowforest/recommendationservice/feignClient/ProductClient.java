package com.rainbowforest.recommendationservice.feignClient;

import com.rainbowforest.recommendationservice.model.Product;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "product-catalog-service", url = "http://localhost:8810")
public interface ProductClient {

    @GetMapping(value = "/products")
    List<Product> getAllProducts();

    @GetMapping(value = "/products/{id}")
    Product getProductById(@PathVariable("id") Long productId);
}
