package com.rainbowforest.productcatalogservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.productcatalogservice.client.ActivityLogFeignClient;
import com.rainbowforest.productcatalogservice.client.OrderFeignClient;
import com.rainbowforest.productcatalogservice.client.dto.ActivityLogRequest;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import com.rainbowforest.productcatalogservice.repository.ProductVariantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);
    private static final Pattern SAFE_NAME = Pattern.compile("^[\\p{L}\\p{N}]+([\\p{L}\\p{N}\\s-]*[\\p{L}\\p{N}])?$");

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ActivityLogFeignClient activityLogFeignClient;
    private final OrderFeignClient orderFeignClient;
    private final ObjectMapper objectMapper;

    public ProductServiceImpl(
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            ActivityLogFeignClient activityLogFeignClient,
            OrderFeignClient orderFeignClient,
            ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.activityLogFeignClient = activityLogFeignClient;
        this.orderFeignClient = orderFeignClient;
        this.objectMapper = objectMapper;
    }

    private void attachPricing(Product p) {
        if (p != null) {
            p.applyEffectivePrice();
            attachVariantPriceRange(p);
        }
    }

    private void attachVariantPriceRange(Product p) {
        if (p == null || p.getId() == null) {
            return;
        }
        try {
            List<com.rainbowforest.productcatalogservice.entity.ProductVariant> variants = productVariantRepository.findByProduct_IdOrderByIdAsc(p.getId());
            if (variants == null || variants.isEmpty()) {
                return;
            }
            java.math.BigDecimal min = null;
            java.math.BigDecimal max = null;
            for (com.rainbowforest.productcatalogservice.entity.ProductVariant v : variants) {
                if (v.getPrice() != null) {
                    if (min == null || v.getPrice().compareTo(min) < 0) min = v.getPrice();
                    if (max == null || v.getPrice().compareTo(max) > 0) max = v.getPrice();
                }
            }
            p.setMinVariantPrice(min);
            p.setMaxVariantPrice(max);
        } catch (Exception e) {
            log.debug("Bỏ qua lỗi tính khoảng giá variant productId={}: {}", p.getId(), e.toString());
        }
    }

    private void attachPricing(List<Product> list) {
        if (list == null) {
            return;
        }
        for (Product p : list) {
            attachPricing(p);
        }
    }

    @Override
    public List<Product> getAllProduct() {
        List<Product> list = productRepository.findAllFetched();
        attachPricing(list);
        return list;
    }

    @Override
    public List<Product> getAllAvailableProductForUser() {
        List<Product> list = productRepository.findAllAvailableForUser();
        attachPricing(list);
        return list;
    }

    @Override
    public List<Product> getAllAvailableProductForUserByCategoryId(Long categoryId) {
        if (categoryId == null || categoryId <= 0) {
            return java.util.Collections.emptyList();
        }
        List<Product> list = productRepository.findAllAvailableForUserByCategoryId(categoryId);
        attachPricing(list);
        return list;
    }

    @Override
    public List<Product> getNewestAvailableProductsForUser(int limit) {
        List<Product> list = productRepository.findAllAvailableForUserOrderByNewest();
        if (list != null && list.size() > limit) {
            list = list.subList(0, limit);
        }
        attachPricing(list);
        return list;
    }

    @Override
    public List<Product> getHotAvailableProductsForUser(int limit) {
        List<Product> list = productRepository.findAllAvailableForUserOrderBySalesCount();
        if (list != null && list.size() > limit) {
            list = list.subList(0, limit);
        }
        attachPricing(list);
        return list;
    }

    @Override
    public List<Product> getAvailableProductsByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new java.util.ArrayList<>();
        }
        List<Product> list = productRepository.findAllAvailableForUserByIds(ids);
        attachPricing(list);
        return list;
    }

    @Override
    public List<Product> getAllProductByCategory(String category) {
        List<Product> list = productRepository.findAllByCategory(category);
        attachPricing(list);
        return list;
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findByIdFetched(id).map(p -> {
            attachPricing(p);
            return p;
        }).orElse(null);
    }

    @Override
    public Product getProductForAdminById(Long id) {
        if (id == null) {
            return null;
        }
        return productRepository.findByIdAdminFetched(id).map(p -> {
            attachPricing(p);
            return p;
        }).orElse(null);
    }

    @Override
    public List<Product> getAllProductsByName(String name) {
        List<Product> list = productRepository.findAllByProductName(name);
        attachPricing(list);
        return list;
    }

    @Override
    public Product addProduct(Product product, String actorUsername, String actorUserId) {
        if (product == null) {
            throw new IllegalArgumentException("bad request");
        }
        if (product.getProductName() == null || product.getProductName().trim().isEmpty()) {
            throw new IllegalArgumentException("productName is required");
        }
        String nameTrim = product.getProductName().trim();
        if (!SAFE_NAME.matcher(nameTrim).matches()) {
            throw new IllegalArgumentException("productName contains special characters");
        }
        if (productRepository.existsByProductNameIgnoreCase(nameTrim)) {
            throw new IllegalArgumentException("DUPLICATE_PRODUCT_NAME");
        }
        product.setProductName(nameTrim);

        // Validação de categoria: aceita tanto categoryEntity (legado) quanto categories (ManyToMany)
        boolean hasCategory = (product.getCategoryEntity() != null && product.getCategoryEntity().getId() != null)
                || (product.getCategories() != null && !product.getCategories().isEmpty());
        if (!hasCategory) {
            throw new IllegalArgumentException("categoryId is required");
        }

        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("price must be > 0");
        }
        if (product.getAvailability() == null || product.getAvailability() < 0) {
            product.setAvailability(0);
        }
        product.setHidden(Boolean.FALSE);
        product.setDeletedAt(null);
        product.setDeletedBy(null);
        product.setDeletedByUserId(null);

        Product saved = productRepository.save(product);
        attachPricing(saved);
        log.info("Đã tạo sản phẩm id={}, name={}, actor={}", saved.getId(), saved.getProductName(), actorUsername);
        Map<String, Object> afterSnap = productFullSnapshot(saved);
        sendProductActivityLog("PRODUCT_CREATE", "POST", "/admin/products", saved.getId(),
                null, afterSnap, actorUsername, actorUserId, afterSnap);
        return saved;
    }

    @Override
    public Product updateProduct(Long id, Product patch, String actorUsername, String actorUserId) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found"));
        Map<String, Object> beforeSnap = productFullSnapshot(existing);
        if (patch.getProductName() == null || patch.getProductName().trim().isEmpty()) {
            throw new IllegalArgumentException("productName is required");
        }
        String nameTrim = patch.getProductName().trim();
        if (!SAFE_NAME.matcher(nameTrim).matches()) {
            throw new IllegalArgumentException("productName contains special characters");
        }
        if (productRepository.existsByProductNameIgnoreCaseAndIdNot(nameTrim, id)) {
            throw new IllegalArgumentException("DUPLICATE_PRODUCT_NAME");
        }
        existing.setProductName(nameTrim);
        if (patch.getDiscription() != null) {
            existing.setDiscription(patch.getDiscription());
        }
        // Hỗ trợ cả hai cách gán danh mục: categoryEntity (legado) và categories (ManyToMany)
        boolean hasPatchCategory = (patch.getCategoryEntity() != null && patch.getCategoryEntity().getId() != null)
                || (patch.getCategories() != null && !patch.getCategories().isEmpty());
        if (!hasPatchCategory) {
            throw new IllegalArgumentException("categoryId is required");
        }
        if (patch.getCategoryEntity() != null && patch.getCategoryEntity().getId() != null) {
            existing.setCategoryEntity(patch.getCategoryEntity());
        }
        if (patch.getCategories() != null && !patch.getCategories().isEmpty()) {
            existing.setCategories(patch.getCategories());
        }
        // Gán brand nếu được truyền vào
        if (patch.getBrand() != null) {
            existing.setBrand(patch.getBrand());
        }
        if (patch.getPrice() == null || patch.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("price must be > 0");
        }
        existing.setPrice(patch.getPrice());
        if (patch.getSku() != null) {
            String newSku = patch.getSku().trim();
            if (!newSku.isEmpty()) {
                String oldSku = existing.getSku() != null ? existing.getSku().trim() : "";
                if (!newSku.equals(oldSku) && productRepository.existsBySku(newSku)) {
                    throw new IllegalArgumentException("DUPLICATE_SKU");
                }
                existing.setSku(newSku);
            }
        }
        // Tồn kho được quản lý qua inventory-service. Không sửa trực tiếp qua API update product.
        if (existing.getAvailability() == null) {
            existing.setAvailability(0);
        }
        Product saved = productRepository.save(existing);
        attachPricing(saved);
        log.info("Đã cập nhật sản phẩm id={}, name={}, actor={}", saved.getId(), saved.getProductName(), actorUsername);
        sendProductActivityLog("PRODUCT_UPDATE", "PUT", "/admin/products/" + id, saved.getId(),
                beforeSnap, productFullSnapshot(saved), actorUsername, actorUserId, null);
        return saved;
    }

    /** Snapshot đầy đủ để khôi phục / so sánh (nhật ký schemaVersion 2). */
    private static Map<String, Object> productFullSnapshot(Product p) {
        Map<String, Object> m = new LinkedHashMap<>();
        if (p.getId() != null) {
            m.put("productId", p.getId());
        }
        m.put("productName", p.getProductName());
        m.put("discription", p.getDiscription());
        m.put("categoryId", p.getCategoryId());
        m.put("price", p.getPrice() != null ? p.getPrice().toPlainString() : null);
        m.put("availability", p.getAvailability());
        m.put("hidden", Boolean.TRUE.equals(p.getHidden()));
        m.put("sku", p.getSku());
        return m;
    }

    @Override
    public void deleteProduct(Long productId, String actorUsername, String actorUserId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("not found"));
        // Check if product is in a CREATED order
        try {
            Boolean inNewOrder = orderFeignClient.checkProductInOrder(productId, "CREATED");
            if (inNewOrder != null && inNewOrder) {
                throw new IllegalStateException("Không thể xóa sản phẩm đang có trong đơn hàng Mới (CREATED).");
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Không thể kiểm tra trạng thái đơn hàng của sản phẩm {}", productId, e);
        }

        // "Ẩn" và "xóa mềm" là 2 trạng thái khác nhau:
        // - hidden=true, deletedAt=null: chỉ ẩn, vẫn cho phép xóa mềm
        // - deletedAt!=null: đã xóa mềm, không xóa lại
        if (p.getDeletedAt() != null) {
            throw new IllegalArgumentException("already deleted");
        }
        Map<String, Object> beforeSnap = productFullSnapshot(p);
        String actor = actorUsername != null && !actorUsername.trim().isEmpty() ? actorUsername.trim() : "system";
        String uid = actorUserId != null && !actorUserId.trim().isEmpty() ? actorUserId.trim() : null;
        p.setHidden(Boolean.TRUE);
        p.setDeletedAt(LocalDateTime.now());
        p.setDeletedBy(actor);
        p.setDeletedByUserId(uid);
        p.setUpdatedBy(actor);
        p.setUpdatedByUserId(uid);
        Product saved = productRepository.save(p);
        log.info("Đã ẩn mềm sản phẩm id={}, name={}, sku={}, actor={}, actorUserId={}",
                productId, saved.getProductName(), saved.getSku(), actorUsername, actorUserId);
        sendProductDeleteActivityLog(productId, beforeSnap, actorUsername, actorUserId);
    }

    @Override
    public Product restoreProduct(Long productId, String actorUsername, String actorUserId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("not found"));
        // Khôi phục dành cho bản ghi đã xóa mềm; sản phẩm chỉ "ẩn" dùng API unhide riêng.
        if (p.getDeletedAt() == null) {
            throw new IllegalArgumentException("not deleted");
        }
        Map<String, Object> beforeSnap = productFullSnapshot(p);
        String actor = actorUsername != null && !actorUsername.trim().isEmpty() ? actorUsername.trim() : "system";
        String uid = actorUserId != null && !actorUserId.trim().isEmpty() ? actorUserId.trim() : null;
        p.setHidden(Boolean.FALSE);
        p.setDeletedAt(null);
        p.setDeletedBy(null);
        p.setDeletedByUserId(null);
        p.setUpdatedBy(actor);
        p.setUpdatedByUserId(uid);
        Product saved = productRepository.save(p);
        sendProductActivityLog("PRODUCT_RESTORE", "POST", "/admin/products/" + productId + "/restore", productId,
                beforeSnap, productFullSnapshot(saved), actorUsername, actorUserId, null);
        return saved;
    }

    @Override
    public Product setProductHidden(Long productId, boolean hidden, String actorUsername, String actorUserId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("not found"));
        if (p.getDeletedAt() != null) {
            throw new IllegalArgumentException("deleted");
        }
        Map<String, Object> beforeSnap = productFullSnapshot(p);
        String actor = actorUsername != null && !actorUsername.trim().isEmpty() ? actorUsername.trim() : "system";
        String uid = actorUserId != null && !actorUserId.trim().isEmpty() ? actorUserId.trim() : null;
        p.setHidden(hidden ? Boolean.TRUE : Boolean.FALSE);
        p.setUpdatedBy(actor);
        p.setUpdatedByUserId(uid);
        Product saved = productRepository.save(p);
        sendProductActivityLog(hidden ? "PRODUCT_HIDE" : "PRODUCT_UNHIDE",
                "POST",
                "/admin/products/" + productId + (hidden ? "/hide" : "/unhide"),
                productId,
                beforeSnap,
                productFullSnapshot(saved),
                actorUsername,
                actorUserId,
                Map.of("hidden", hidden));
        return saved;
    }

    private void sendProductActivityLog(
            String action,
            String httpMethod,
            String path,
            Long productId,
            Map<String, Object> before,
            Map<String, Object> after,
            String actorUsername,
            String actorUserId,
            Map<String, Object> newDataOnly) {
        try {
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("schemaVersion", 2);
            detail.put("resourceType", "Product");
            if (productId != null) {
                detail.put("productId", productId);
            }
            if (before != null && !before.isEmpty()) {
                detail.put("before", before);
            }
            if (after != null && !after.isEmpty()) {
                detail.put("after", after);
            }
            if (newDataOnly != null && !newDataOnly.isEmpty()) {
                detail.put("newData", newDataOnly);
            }
            detail.put("at", Instant.now().toString());
            detail.put("actorUsername", actorUsername != null && !actorUsername.trim().isEmpty()
                    ? actorUsername.trim() : "system");
            detail.put("actorUserId", actorUserId != null && !actorUserId.trim().isEmpty()
                    ? actorUserId.trim() : null);

            ActivityLogRequest req = new ActivityLogRequest();
            req.setAction(action);
            req.setResourceType("Product");
            req.setResourceId(String.valueOf(productId));
            req.setHttpMethod(httpMethod);
            req.setRequestPath(path);
            req.setActorUsername(actorUsername != null ? actorUsername.trim() : null);
            req.setActorUserId(actorUserId != null ? actorUserId.trim() : null);
            String performedBy = actorUsername != null && !actorUsername.trim().isEmpty()
                    ? actorUsername.trim() : "system";
            req.setPerformedBy(performedBy);
            req.setDetailJson(objectMapper.writeValueAsString(detail));
            activityLogFeignClient.log(req);
        } catch (Exception e) {
            log.warn("Không ghi activity log {} sản phẩm id={}: {}", action, productId, e.toString());
        }
    }

    private void sendProductDeleteActivityLog(
            Long productId,
            Map<String, Object> beforeSnap,
            String actorUsername,
            String actorUserId) {
        try {
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("schemaVersion", 2);
            detail.put("resourceType", "Product");
            detail.put("productId", productId);
            detail.put("before", beforeSnap);
            detail.put("deletedAt", Instant.now().toString());
            detail.put("deletedByUsername", actorUsername != null && !actorUsername.trim().isEmpty()
                    ? actorUsername.trim() : "system");
            detail.put("deletedByUserId", actorUserId != null && !actorUserId.trim().isEmpty()
                    ? actorUserId.trim() : null);

            ActivityLogRequest req = new ActivityLogRequest();
            req.setAction("PRODUCT_DELETE");
            req.setResourceType("Product");
            req.setResourceId(String.valueOf(productId));
            req.setHttpMethod("DELETE");
            req.setRequestPath("/admin/products/" + productId);
            req.setActorUsername(actorUsername != null ? actorUsername.trim() : null);
            req.setActorUserId(actorUserId != null ? actorUserId.trim() : null);
            String performedBy = actorUsername != null && !actorUsername.trim().isEmpty()
                    ? actorUsername.trim() : "system";
            req.setPerformedBy(performedBy);
            req.setDetailJson(objectMapper.writeValueAsString(detail));
            activityLogFeignClient.log(req);
        } catch (Exception e) {
            log.warn("Không ghi activity log khi xóa sản phẩm id={}: {}", productId, e.toString());
        }
    }

    @Override
    public void incrementViewCount(Long productId) {
        if (productId == null) return;
        productRepository.findById(productId).ifPresent(p -> {
            p.setViewCount(p.getViewCount() + 1);
            productRepository.save(p);
        });
    }

    @Override
    public void incrementSalesCount(Long productId, Long quantity) {
        if (productId == null || quantity == null || quantity <= 0) return;
        productRepository.findById(productId).ifPresent(p -> {
            p.setSalesCount(p.getSalesCount() + quantity);
            productRepository.save(p);
        });
    }
}
