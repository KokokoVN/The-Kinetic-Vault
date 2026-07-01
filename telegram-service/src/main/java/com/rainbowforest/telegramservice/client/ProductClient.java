package com.rainbowforest.telegramservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.Map;

@FeignClient(name = "product-catalog-service")
public interface ProductClient {
    @GetMapping("/admin/products/paged")
    JsonNode getProducts(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam(value = "q", required = false) String q);

    @PostMapping("/admin/products/excel/confirm")
    Map<String, Object> confirmImport(@RequestBody JsonNode rows,
                                      @RequestHeader(value = "X-Username", required = false) String username,
                                      @RequestHeader(value = "X-User-Id", required = false) String userId);

    @GetMapping("/admin/products/{id}")
    JsonNode getProductById(@PathVariable("id") Long id);

    @GetMapping("/admin/products/{id}/variants")
    JsonNode getProductVariants(@PathVariable("id") Long id);

    @GetMapping("/admin/products/{id}/specs")
    JsonNode getProductSpecs(@PathVariable("id") Long id);

    @GetMapping("/admin/products/{id}/images")
    JsonNode getProductImages(@PathVariable("id") Long id);

    @PutMapping("/admin/products/{id}")
    JsonNode updateProduct(@PathVariable("id") Long id, @RequestBody JsonNode body,
                           @RequestHeader(value = "X-Username", required = false) String username,
                           @RequestHeader(value = "X-User-Id", required = false) String userId);

    @DeleteMapping("/admin/products/{id}")
    void deleteProduct(@PathVariable("id") Long id,
                       @RequestHeader(value = "X-Username", required = false) String username,
                       @RequestHeader(value = "X-User-Id", required = false) String userId);

    @PutMapping("/admin/products/{id}/images/{imageId}/primary")
    JsonNode setPrimaryImage(@PathVariable("id") Long productId, @PathVariable("imageId") Long imageId,
                             @RequestHeader(value = "X-Username", required = false) String username,
                             @RequestHeader(value = "X-User-Id", required = false) String userId);

    @PostMapping("/admin/products/{id}/variants")
    JsonNode addVariant(@PathVariable("id") Long id, @RequestBody JsonNode variant,
                        @RequestHeader(value = "X-Username", required = false) String username,
                        @RequestHeader(value = "X-User-Id", required = false) String userId);

    @DeleteMapping("/admin/products/{id}/variants/{variantId}")
    void deleteVariant(@PathVariable("id") Long productId, @PathVariable("variantId") Long variantId,
                       @RequestHeader(value = "X-Username", required = false) String username,
                       @RequestHeader(value = "X-User-Id", required = false) String userId);

    @PostMapping("/admin/products/{id}/specs")
    JsonNode addSpec(@PathVariable("id") Long id, @RequestBody JsonNode spec,
                     @RequestHeader(value = "X-Username", required = false) String username,
                     @RequestHeader(value = "X-User-Id", required = false) String userId);

    @DeleteMapping("/admin/products/{id}/specs/{specId}")
    void deleteSpec(@PathVariable("id") Long productId, @PathVariable("specId") Long specId,
                    @RequestHeader(value = "X-Username", required = false) String username,
                    @RequestHeader(value = "X-User-Id", required = false) String userId);

    @PostMapping("/admin/products/excel/generate-errors")
    byte[] generateErrorExcel(@RequestBody JsonNode rows);
}
