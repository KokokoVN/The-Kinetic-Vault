package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.ProductChangeLog;
import com.rainbowforest.productcatalogservice.repository.ProductChangeLogRepository;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin API để xem lịch sử thay đổi của sản phẩm.
 */
@RestController
@RequestMapping("/admin/products")
public class ProductChangeLogController {

    private final ProductChangeLogRepository changeLogRepository;
    private final ProductRepository productRepository;

    public ProductChangeLogController(
            ProductChangeLogRepository changeLogRepository,
            ProductRepository productRepository) {
        this.changeLogRepository = changeLogRepository;
        this.productRepository = productRepository;
    }

    /**
     * GET /admin/products/{productId}/change-logs
     * Lấy lịch sử thay đổi của một sản phẩm, mới nhất trước.
     */
    @GetMapping("/{productId}/change-logs")
    public ResponseEntity<List<ProductChangeLog>> getChangeLogs(@PathVariable Long productId) {
        if (!productRepository.existsById(productId)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        List<ProductChangeLog> logs = changeLogRepository.findByProductIdOrderByChangedAtDesc(productId);
        return ResponseEntity.ok(logs);
    }
}
