package com.rainbowforest.aichatbotservice.client;

import com.rainbowforest.aichatbotservice.dto.catalog.ProductSearchResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "product-catalog-service",
        url = "${product.catalog.service.url:http://localhost:8810}"
)
public interface ProductCatalogClient {

    /**
     * Dùng /products/search vì luôn trả 200 kèm items (tránh 404 khi danh sách rỗng như /products/available).
     */
    @GetMapping("/products/search")
    ProductSearchResponse searchProducts(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "status", required = false, defaultValue = "all") String status,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "100") int size
    );

    @GetMapping("/products/{id}")
    java.util.Map<String, Object> getProductById(@org.springframework.web.bind.annotation.PathVariable("id") Long id);

    @GetMapping("/products/{productId}/variants")
    java.util.List<java.util.Map<String, Object>> getVariantsForProduct(@org.springframework.web.bind.annotation.PathVariable("productId") Long productId);
}
