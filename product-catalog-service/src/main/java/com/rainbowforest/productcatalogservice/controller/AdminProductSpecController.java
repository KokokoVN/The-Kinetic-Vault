package com.rainbowforest.productcatalogservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.productcatalogservice.client.ActivityLogFeignClient;
import com.rainbowforest.productcatalogservice.client.dto.ActivityLogRequest;
import com.rainbowforest.productcatalogservice.dto.ProductTechnicalSpecRequest;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.entity.ProductChangeLog;
import com.rainbowforest.productcatalogservice.entity.ProductTechnicalSpec;
import com.rainbowforest.productcatalogservice.repository.ProductChangeLogRepository;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import com.rainbowforest.productcatalogservice.repository.ProductTechnicalSpecRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/products")
public class AdminProductSpecController {
    private static final Logger log = LoggerFactory.getLogger(AdminProductSpecController.class);

    private final ProductRepository productRepository;
    private final ProductTechnicalSpecRepository specRepository;
    private final ProductChangeLogRepository changeLogRepository;
    private final ActivityLogFeignClient activityLogFeignClient;
    private final ObjectMapper objectMapper;

    public AdminProductSpecController(
            ProductRepository productRepository,
            ProductTechnicalSpecRepository specRepository,
            ProductChangeLogRepository changeLogRepository,
            ActivityLogFeignClient activityLogFeignClient,
            ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.specRepository = specRepository;
        this.changeLogRepository = changeLogRepository;
        this.activityLogFeignClient = activityLogFeignClient;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/{productId}/specs")
    public ResponseEntity<List<ProductTechnicalSpec>> listSpecs(@PathVariable Long productId) {
        Product p = productRepository.findById(productId).orElse(null);
        if (p == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(specRepository.findByProduct_IdOrderBySortOrderAscIdAsc(productId));
    }

    @PostMapping("/{productId}/specs")
    public ResponseEntity<ProductTechnicalSpec> addSpec(
            @PathVariable Long productId,
            @Valid @RequestBody ProductTechnicalSpecRequest req) {
        Product p = productRepository.findById(productId).orElse(null);
        if (p == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        ProductTechnicalSpec s = new ProductTechnicalSpec();
        s.setProduct(p);
        s.setSpecKey(req.getSpecKey().trim());
        s.setSpecValue(req.getSpecValue().trim());
        s.setUnit(req.getUnit() != null && !req.getUnit().trim().isEmpty() ? req.getUnit().trim() : null);
        s.setSortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0);
        s.setSpecGroup(req.getSpecGroup() != null && !req.getSpecGroup().trim().isEmpty()
                ? req.getSpecGroup().trim() : null);
        if (req.getPerformedBy() != null && !req.getPerformedBy().trim().isEmpty()) {
            s.setCreatedBy(req.getPerformedBy().trim());
            s.setUpdatedBy(req.getPerformedBy().trim());
        }
        ProductTechnicalSpec saved = specRepository.save(s);

        // Ghi nhật ký ProductChangeLog
        saveChangeLog(productId,
                "spec_added",
                null,
                saved.getSpecKey() + " = " + saved.getSpecValue()
                        + (saved.getSpecGroup() != null ? " [nhóm: " + saved.getSpecGroup() + "]" : ""),
                req.getPerformedBy(), null);

        sendSpecLog("PRODUCT_SPEC_CREATE", "POST", "/admin/products/" + productId + "/specs", saved, req.getPerformedBy(), null);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{productId}/specs/{specId}")
    public ResponseEntity<ProductTechnicalSpec> updateSpec(
            @PathVariable Long productId,
            @PathVariable Long specId,
            @Valid @RequestBody ProductTechnicalSpecRequest req) {
        ProductTechnicalSpec s = specRepository.findById(specId).orElse(null);
        if (s == null || s.getProduct() == null || !productId.equals(s.getProduct().getId())) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        String oldSummary = s.getSpecKey() + " = " + s.getSpecValue()
                + (s.getSpecGroup() != null ? " [nhóm: " + s.getSpecGroup() + "]" : "");

        s.setSpecKey(req.getSpecKey().trim());
        s.setSpecValue(req.getSpecValue().trim());
        s.setUnit(req.getUnit() != null && !req.getUnit().trim().isEmpty() ? req.getUnit().trim() : null);
        if (req.getSortOrder() != null) {
            s.setSortOrder(req.getSortOrder());
        }
        s.setSpecGroup(req.getSpecGroup() != null && !req.getSpecGroup().trim().isEmpty()
                ? req.getSpecGroup().trim() : null);
        if (req.getPerformedBy() != null && !req.getPerformedBy().trim().isEmpty()) {
            s.setUpdatedBy(req.getPerformedBy().trim());
        }
        ProductTechnicalSpec saved = specRepository.save(s);

        String newSummary = saved.getSpecKey() + " = " + saved.getSpecValue()
                + (saved.getSpecGroup() != null ? " [nhóm: " + saved.getSpecGroup() + "]" : "");

        // Ghi nhật ký ProductChangeLog
        saveChangeLog(productId,
                "spec_updated[" + specId + "]",
                oldSummary,
                newSummary,
                req.getPerformedBy(), null);

        sendSpecLog("PRODUCT_SPEC_UPDATE", "PUT", "/admin/products/" + productId + "/specs/" + specId, saved, req.getPerformedBy(), null);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{productId}/specs/{specId}")
    public ResponseEntity<?> deleteSpec(@PathVariable Long productId, @PathVariable Long specId) {
        ProductTechnicalSpec s = specRepository.findById(specId).orElse(null);
        if (s == null || s.getProduct() == null || !productId.equals(s.getProduct().getId())) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        String oldSummary = s.getSpecKey() + " = " + s.getSpecValue()
                + (s.getSpecGroup() != null ? " [nhóm: " + s.getSpecGroup() + "]" : "");

        specRepository.delete(s);

        // Ghi nhật ký ProductChangeLog
        saveChangeLog(productId,
                "spec_deleted[" + specId + "]",
                oldSummary,
                null,
                null, null);

        sendSpecDeleteLog(productId, specId, s);
        return ResponseEntity.noContent().build();
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

    private void sendSpecLog(String action, String method, String path, ProductTechnicalSpec spec, String actorUsername, String actorUserId) {
        try {
            Map<String, Object> after = new LinkedHashMap<>();
            after.put("specId", spec.getId());
            after.put("productId", spec.getProduct() != null ? spec.getProduct().getId() : null);
            after.put("specKey", spec.getSpecKey());
            after.put("specValue", spec.getSpecValue());
            after.put("unit", spec.getUnit());
            after.put("sortOrder", spec.getSortOrder());
            after.put("specGroup", spec.getSpecGroup());
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("resourceType", "ProductTechnicalSpec");
            detail.put("after", after);
            ActivityLogRequest req = new ActivityLogRequest();
            req.setAction(action);
            req.setResourceType("ProductTechnicalSpec");
            req.setResourceId(String.valueOf(spec.getId()));
            req.setHttpMethod(method);
            req.setRequestPath(path);
            req.setActorUsername(actorUsername);
            req.setActorUserId(actorUserId);
            req.setPerformedBy(actorUsername != null && !actorUsername.trim().isEmpty() ? actorUsername.trim() : "system");
            req.setDetailJson(objectMapper.writeValueAsString(detail));
            activityLogFeignClient.log(req);
        } catch (Exception e) {
            log.warn("Không ghi activity log {} specId={}: {}", action, spec != null ? spec.getId() : null, e.toString());
        }
    }

    private void sendSpecDeleteLog(Long productId, Long specId, ProductTechnicalSpec spec) {
        try {
            Map<String, Object> before = new LinkedHashMap<>();
            before.put("specId", specId);
            before.put("productId", productId);
            before.put("specKey", spec.getSpecKey());
            before.put("specValue", spec.getSpecValue());
            before.put("unit", spec.getUnit());
            before.put("sortOrder", spec.getSortOrder());
            before.put("specGroup", spec.getSpecGroup());
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("resourceType", "ProductTechnicalSpec");
            detail.put("before", before);
            ActivityLogRequest req = new ActivityLogRequest();
            req.setAction("PRODUCT_SPEC_DELETE");
            req.setResourceType("ProductTechnicalSpec");
            req.setResourceId(String.valueOf(specId));
            req.setHttpMethod("DELETE");
            req.setRequestPath("/admin/products/" + productId + "/specs/" + specId);
            req.setPerformedBy("system");
            req.setDetailJson(objectMapper.writeValueAsString(detail));
            activityLogFeignClient.log(req);
        } catch (Exception e) {
            log.warn("Không ghi activity log PRODUCT_SPEC_DELETE specId={}: {}", specId, e.toString());
        }
    }
}
