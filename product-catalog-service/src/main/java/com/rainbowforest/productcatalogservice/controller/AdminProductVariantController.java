package com.rainbowforest.productcatalogservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.productcatalogservice.client.ActivityLogFeignClient;
import com.rainbowforest.productcatalogservice.client.dto.ActivityLogRequest;
import com.rainbowforest.productcatalogservice.dto.ProductVariantRequest;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.entity.ProductChangeLog;
import com.rainbowforest.productcatalogservice.entity.ProductImage;
import com.rainbowforest.productcatalogservice.entity.ProductVariant;
import com.rainbowforest.productcatalogservice.repository.ProductChangeLogRepository;
import com.rainbowforest.productcatalogservice.repository.ProductImageRepository;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import com.rainbowforest.productcatalogservice.repository.ProductVariantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/products")
public class AdminProductVariantController {
    private static final Logger log = LoggerFactory.getLogger(AdminProductVariantController.class);
    private static Path getRootUploadPath(String subDir) {
        Path path = Paths.get(System.getProperty("user.dir"));
        if (path.getFileName().toString().endsWith("-service")) {
            path = path.getParent();
        }
        return path.resolve("uploads").resolve(subDir);
    }
    private static final Path PRODUCT_UPLOAD_DIR = getRootUploadPath("product-images");
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductChangeLogRepository changeLogRepository;
    private final ProductImageRepository productImageRepository;
    private final ActivityLogFeignClient activityLogFeignClient;
    private final ObjectMapper objectMapper;

    public AdminProductVariantController(
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            ProductChangeLogRepository changeLogRepository,
            ProductImageRepository productImageRepository,
            ActivityLogFeignClient activityLogFeignClient,
            ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.changeLogRepository = changeLogRepository;
        this.productImageRepository = productImageRepository;
        this.activityLogFeignClient = activityLogFeignClient;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/{productId}/variants")
    public ResponseEntity<List<ProductVariant>> listVariants(@PathVariable Long productId) {
        Product p = productRepository.findById(productId).orElse(null);
        if (p == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(productVariantRepository.findByProduct_IdOrderByIdAsc(productId));
    }

    @PostMapping("/{productId}/variants")
    public ResponseEntity<?> addVariant(@PathVariable Long productId, @Valid @RequestBody ProductVariantRequest req) {
        Product p = productRepository.findById(productId).orElse(null);
        if (p == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        String size = req.getSize() != null ? req.getSize().trim() : "";
        String color = req.getColor() != null ? req.getColor().trim() : "";
        if (size.isEmpty() || color.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "size và color là bắt buộc"));
        }
        if (productVariantRepository.existsByProduct_IdAndSizeIgnoreCaseAndColorIgnoreCase(productId, size, color)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "DUPLICATE_VARIANT",
                    "message", "Biến thể size + màu đã tồn tại."));
        }
        if (req.getPrice() == null || req.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Giá biến thể phải > 0"));
        }
        int availability = req.getAvailability() != null && req.getAvailability() >= 0 ? req.getAvailability() : 0;
        ProductVariant v = new ProductVariant();
        v.setProduct(p);
        v.setSize(size);
        v.setColor(color);
        v.setVariantImageUrl(req.getVariantImageUrl() != null && !req.getVariantImageUrl().trim().isEmpty()
                ? req.getVariantImageUrl().trim() : null);
        v.setPrice(req.getPrice());
        v.setAvailability(availability);
        if (req.getPerformedBy() != null && !req.getPerformedBy().trim().isEmpty()) {
            v.setCreatedBy(req.getPerformedBy().trim());
            v.setUpdatedBy(req.getPerformedBy().trim());
        }
        ProductVariant saved = productVariantRepository.save(v);

        // Ghi nhật ký ProductChangeLog
        saveChangeLog(productId,
                "variant_added",
                null,
                "size=" + size + ", color=" + color + ", price=" + req.getPrice(),
                req.getPerformedBy(), null);

        sendVariantLog("PRODUCT_VARIANT_CREATE", "POST", "/admin/products/" + productId + "/variants", saved, req.getPerformedBy(), null);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/{productId}/variants/{variantId}")
    public ResponseEntity<?> deleteVariant(@PathVariable Long productId, @PathVariable Long variantId) {
        ProductVariant v = productVariantRepository.findById(variantId).orElse(null);
        if (v == null || v.getProduct() == null || !productId.equals(v.getProduct().getId())) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        String oldSummary = "size=" + v.getSize() + ", color=" + v.getColor()
                + ", price=" + (v.getPrice() != null ? v.getPrice().toPlainString() : "null");
        
        // Delete associated image file and DB record
        if (v.getVariantImageUrl() != null && !v.getVariantImageUrl().trim().isEmpty()) {
            try {
                String url = v.getVariantImageUrl();
                int lastSlash = url.lastIndexOf('/');
                String filename = lastSlash >= 0 ? url.substring(lastSlash + 1) : url;
                
                // 1. Delete physical file
                Path filePath = PRODUCT_UPLOAD_DIR.resolve(filename).normalize();
                Files.deleteIfExists(filePath);
                log.info("Deleted physical image for variant: {}", filePath);

                // 2. Delete from ProductImage table
                List<ProductImage> images = productImageRepository.findByProduct_IdOrderBySortOrderAsc(productId);
                if (images != null) {
                    ProductImage removedImg = null;
                    for (ProductImage img : images) {
                        if (img.getImageUrl() != null && img.getImageUrl().endsWith(filename)) {
                            removedImg = img;
                            break;
                        } else if (img.getStoragePath() != null && img.getStoragePath().equals(filename)) {
                            removedImg = img;
                            break;
                        }
                    }
                    if (removedImg != null) {
                        productImageRepository.delete(removedImg);
                        log.info("Removed ProductImage from DB associated with variant, imageId: {}", removedImg.getId());
                    }
                }
            } catch (Exception e) {
                log.warn("Không thể xóa file ảnh của variant: {}", e.getMessage());
            }
        }
        
        productVariantRepository.delete(v);

        // Ghi nhật ký ProductChangeLog
        saveChangeLog(productId,
                "variant_deleted[" + variantId + "]",
                oldSummary,
                null,
                null, null);

        sendVariantDeleteLog(productId, variantId, v);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{productId}/variants/{variantId}")
    public ResponseEntity<?> updateVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @Valid @RequestBody ProductVariantRequest req) {
        ProductVariant v = productVariantRepository.findById(variantId).orElse(null);
        if (v == null || v.getProduct() == null || !productId.equals(v.getProduct().getId())) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        String size = req.getSize() != null ? req.getSize().trim() : "";
        String color = req.getColor() != null ? req.getColor().trim() : "";
        if (size.isEmpty() || color.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "size và color là bắt buộc"));
        }
        if (productVariantRepository.existsByProduct_IdAndSizeIgnoreCaseAndColorIgnoreCaseAndIdNot(productId, size, color, variantId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "DUPLICATE_VARIANT",
                    "message", "Biến thể size + màu đã tồn tại."));
        }
        if (req.getPrice() == null || req.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Giá biến thể phải > 0"));
        }
        String oldSummary = "size=" + v.getSize() + ", color=" + v.getColor()
                + ", price=" + (v.getPrice() != null ? v.getPrice().toPlainString() : "null");

        int availability = req.getAvailability() != null && req.getAvailability() >= 0 ? req.getAvailability() : 0;
        v.setSize(size);
        v.setColor(color);
        v.setVariantImageUrl(req.getVariantImageUrl() != null && !req.getVariantImageUrl().trim().isEmpty()
                ? req.getVariantImageUrl().trim() : null);
        v.setPrice(req.getPrice());
        v.setAvailability(availability);
        if (req.getPerformedBy() != null && !req.getPerformedBy().trim().isEmpty()) {
            v.setUpdatedBy(req.getPerformedBy().trim());
        }
        ProductVariant saved = productVariantRepository.save(v);

        String newSummary = "size=" + size + ", color=" + color + ", price=" + req.getPrice().toPlainString();

        // Ghi nhật ký ProductChangeLog
        saveChangeLog(productId,
                "variant_updated[" + variantId + "]",
                oldSummary,
                newSummary,
                req.getPerformedBy(), null);

        sendVariantLog("PRODUCT_VARIANT_UPDATE", "PUT", "/admin/products/" + productId + "/variants/" + variantId, saved, req.getPerformedBy(), null);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    // ===================== Internal helpers =====================

    private void saveChangeLog(Long productId, String changedField,
                               String oldValue, String newValue,
                               String changedBy, String changedByUserId) {
        try {
            ProductChangeLog cl = new ProductChangeLog(
                    productId, changedField, oldValue, newValue,
                    changedBy != null ? changedBy : "system",
                    changedByUserId);
            changeLogRepository.save(cl);
        } catch (Exception e) {
            log.warn("Không ghi ProductChangeLog productId={} field={}: {}", productId, changedField, e.toString());
        }
    }

    private void sendVariantLog(String action, String method, String path, ProductVariant variant, String actorUsername, String actorUserId) {
        try {
            Map<String, Object> after = new LinkedHashMap<>();
            after.put("variantId", variant.getId());
            after.put("productId", variant.getProduct() != null ? variant.getProduct().getId() : null);
            after.put("size", variant.getSize());
            after.put("color", variant.getColor());
            after.put("price", variant.getPrice() != null ? variant.getPrice().toPlainString() : null);
            after.put("availability", variant.getAvailability());
            after.put("variantImageUrl", variant.getVariantImageUrl());
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("resourceType", "ProductVariant");
            detail.put("after", after);
            ActivityLogRequest req = new ActivityLogRequest();
            req.setAction(action);
            req.setResourceType("ProductVariant");
            req.setResourceId(String.valueOf(variant.getId()));
            req.setHttpMethod(method);
            req.setRequestPath(path);
            req.setActorUsername(actorUsername);
            req.setActorUserId(actorUserId);
            req.setPerformedBy(actorUsername != null && !actorUsername.trim().isEmpty() ? actorUsername.trim() : "system");
            req.setDetailJson(objectMapper.writeValueAsString(detail));
            activityLogFeignClient.log(req);
        } catch (Exception e) {
            log.warn("Không ghi activity log {} variantId={}: {}", action, variant != null ? variant.getId() : null, e.toString());
        }
    }

    private void sendVariantDeleteLog(Long productId, Long variantId, ProductVariant variant) {
        try {
            Map<String, Object> before = new LinkedHashMap<>();
            before.put("variantId", variantId);
            before.put("productId", productId);
            before.put("size", variant.getSize());
            before.put("color", variant.getColor());
            before.put("price", variant.getPrice() != null ? variant.getPrice().toPlainString() : null);
            before.put("availability", variant.getAvailability());
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("resourceType", "ProductVariant");
            detail.put("before", before);
            ActivityLogRequest req = new ActivityLogRequest();
            req.setAction("PRODUCT_VARIANT_DELETE");
            req.setResourceType("ProductVariant");
            req.setResourceId(String.valueOf(variantId));
            req.setHttpMethod("DELETE");
            req.setRequestPath("/admin/products/" + productId + "/variants/" + variantId);
            req.setPerformedBy("system");
            req.setDetailJson(objectMapper.writeValueAsString(detail));
            activityLogFeignClient.log(req);
        } catch (Exception e) {
            log.warn("Không ghi activity log PRODUCT_VARIANT_DELETE variantId={}: {}", variantId, e.toString());
        }
    }
}
