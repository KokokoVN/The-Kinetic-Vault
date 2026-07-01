package com.rainbowforest.productcatalogservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.productcatalogservice.client.ActivityLogFeignClient;
import com.rainbowforest.productcatalogservice.client.dto.ActivityLogRequest;
import com.rainbowforest.productcatalogservice.dto.CategoryDeletePreview;
import com.rainbowforest.productcatalogservice.entity.Category;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.exception.CategoryDeletionRequiresConfirmationException;
import com.rainbowforest.productcatalogservice.exception.CategoryHasChildCategoriesException;
import com.rainbowforest.productcatalogservice.repository.CategoryRepository;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private static final Logger log = LoggerFactory.getLogger(CategoryServiceImpl.class);

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ActivityLogFeignClient activityLogFeignClient;
    private final ObjectMapper objectMapper;

    public CategoryServiceImpl(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            ActivityLogFeignClient activityLogFeignClient,
            ObjectMapper objectMapper) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.activityLogFeignClient = activityLogFeignClient;
        this.objectMapper = objectMapper;
    }

    private static String normUserId(String actorUserId) {
        if (actorUserId == null) {
            return null;
        }
        String t = actorUserId.trim();
        return t.isEmpty() ? null : t;
    }

    @Override
    public Category save(Category category, String actorUsername, String actorUserId) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("name is required");
        }
        String nameTrim = category.getName().trim();
        if (nameTrim.length() > 120) {
            throw new IllegalArgumentException("name too long");
        }
        category.setName(nameTrim);

        if (categoryRepository.existsByNameIgnoreCaseAndDeletedAtIsNull(nameTrim)) {
            log.warn("Tạo danh mục bị từ chối — trùng tên: name={}, actor={}", nameTrim, actorUsername);
            throw new IllegalArgumentException(CategoryService.DUPLICATE_NAME);
        }

        if (category.getSlug() == null || category.getSlug().trim().isEmpty()) {
            category.setSlug(uniqueSlug(slugify(nameTrim)));
        } else {
            category.setSlug(uniqueSlug(category.getSlug().trim()));
        }

        String actor = (actorUsername != null && !actorUsername.trim().isEmpty())
                ? actorUsername.trim()
                : "system";
        String uid = normUserId(actorUserId);
        category.setCreatedBy(actor);
        category.setUpdatedBy(actor);
        category.setCreatedByUserId(uid);
        category.setUpdatedByUserId(uid);
        category.setDeletedAt(null);
        category.setDeletedBy(null);
        category.setDeletedByUserId(null);
        category.setHidden(Boolean.FALSE);

        Category saved = categoryRepository.save(category);
        log.info("Đã tạo danh mục: id={}, name={}, slug={}, createdBy={}, createdByUserId={}",
                saved.getId(), saved.getName(), saved.getSlug(), saved.getCreatedBy(), saved.getCreatedByUserId());
        Map<String, Object> afterSnap = categorySnapshot(saved);
        sendCategoryActivityLog("CATEGORY_CREATE", "POST", "/admin/categories", saved.getId(),
                null, afterSnap, actor, uid, afterSnap);
        return saved;
    }

    @Override
    public Category update(Long id, Category patch, String actorUsername, String actorUserId) {
        Category existing = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("not found"));
        Map<String, Object> beforeSnap = categorySnapshot(existing);
        if (patch.getName() == null || patch.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("name is required");
        }
        String nameTrim = patch.getName().trim();
        if (nameTrim.length() > 120) {
            throw new IllegalArgumentException("name too long");
        }
        if (categoryRepository.existsByNameIgnoreCaseAndIdNotAndDeletedAtIsNull(nameTrim, id)) {
            log.warn("Cập nhật danh mục bị từ chối — trùng tên: id={}, name={}, actor={}", id, nameTrim, actorUsername);
            throw new IllegalArgumentException(CategoryService.DUPLICATE_NAME);
        }
        existing.setName(nameTrim);
        if (patch.getSlug() == null || patch.getSlug().trim().isEmpty()) {
            existing.setSlug(uniqueSlugExcludingId(slugify(nameTrim), id));
        } else {
            existing.setSlug(uniqueSlugExcludingId(patch.getSlug().trim(), id));
        }
        String actor = (actorUsername != null && !actorUsername.trim().isEmpty())
                ? actorUsername.trim()
                : "system";
        String uid = normUserId(actorUserId);
        existing.setUpdatedBy(actor);
        existing.setUpdatedByUserId(uid);
        Category saved = categoryRepository.save(existing);
        log.info("Đã cập nhật danh mục: id={}, name={}, slug={}, updatedBy={}, updatedByUserId={}",
                saved.getId(), saved.getName(), saved.getSlug(), saved.getUpdatedBy(), saved.getUpdatedByUserId());
        sendCategoryActivityLog("CATEGORY_UPDATE", "PUT", "/admin/categories/" + id, saved.getId(),
                beforeSnap, categorySnapshot(saved), actor, uid, null);
        return saved;
    }

    @Override
    public Category restore(Long id, String actorUsername, String actorUserId) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found"));
        if (cat.getDeletedAt() == null) {
            throw new IllegalArgumentException("not deleted");
        }
        if (categoryRepository.existsByNameIgnoreCaseAndIdNotAndDeletedAtIsNull(cat.getName(), id)) {
            log.warn("Khôi phục danh mục id={} bị từ chối — trùng tên đang hoạt động", id);
            throw new IllegalArgumentException(CategoryService.DUPLICATE_NAME);
        }
        if (cat.getSlug() != null && !cat.getSlug().isEmpty()
                && categoryRepository.existsBySlugAndIdNotAndDeletedAtIsNull(cat.getSlug(), id)) {
            log.warn("Khôi phục danh mục id={} bị từ chối — trùng slug đang hoạt động", id);
            throw new IllegalArgumentException(CategoryService.DUPLICATE_SLUG);
        }
        String actor = (actorUsername != null && !actorUsername.trim().isEmpty())
                ? actorUsername.trim()
                : "system";
        String uid = normUserId(actorUserId);
        Map<String, Object> beforeSnap = categorySnapshot(cat);
        cat.setDeletedAt(null);
        cat.setDeletedBy(null);
        cat.setDeletedByUserId(null);
        cat.setHidden(Boolean.FALSE);
        cat.setUpdatedBy(actor);
        cat.setUpdatedByUserId(uid);
        Category saved = categoryRepository.save(cat);
        int restoredProducts = productRepository.updateHiddenByCategory(id, Boolean.FALSE);
        log.info("Đã khôi phục danh mục: id={}, name={}, restoredProducts={}, updatedBy={}",
                saved.getId(), saved.getName(), restoredProducts, actor);
        Map<String, Object> restoreExtra = new LinkedHashMap<>();
        restoreExtra.put("restoredProducts", restoredProducts);
        sendCategoryActivityLog("CATEGORY_RESTORE", "POST", "/admin/categories/" + id + "/restore", saved.getId(),
                beforeSnap, categorySnapshot(saved), actor, uid, restoreExtra);
        return saved;
    }

    private static Map<String, Object> categorySnapshot(Category c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("categoryId", c.getId());
        m.put("name", c.getName());
        m.put("slug", c.getSlug());
        m.put("hidden", Boolean.TRUE.equals(c.getHidden()));
        return m;
    }

    private void sendCategoryActivityLog(
            String action,
            String httpMethod,
            String requestPath,
            Long categoryId,
            Map<String, Object> before,
            Map<String, Object> after,
            String actorUsername,
            String actorUserId,
            Map<String, Object> newDataOnly) {
        try {
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("schemaVersion", 2);
            detail.put("resourceType", "Category");
            if (categoryId != null) {
                detail.put("categoryId", categoryId);
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
            req.setResourceType("Category");
            req.setResourceId(String.valueOf(categoryId));
            req.setHttpMethod(httpMethod);
            req.setRequestPath(requestPath);
            req.setActorUsername(actorUsername != null ? actorUsername.trim() : null);
            req.setActorUserId(actorUserId != null ? actorUserId.trim() : null);
            String performedBy = actorUsername != null && !actorUsername.trim().isEmpty()
                    ? actorUsername.trim() : "system";
            req.setPerformedBy(performedBy);
            req.setDetailJson(objectMapper.writeValueAsString(detail));
            activityLogFeignClient.log(req);
        } catch (Exception e) {
            log.warn("Không ghi activity log {} danh mục id={}: {}", action, categoryId, e.toString());
        }
    }

    private static String slugify(String input) {
        String s = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        s = s.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return s.isEmpty() ? "category" : s;
    }

    private String uniqueSlug(String base) {
        String slug = base;
        int n = 0;
        while (categoryRepository.existsBySlugAndDeletedAtIsNull(slug)) {
            n++;
            slug = base + "-" + n;
            if (n > 1000) {
                slug = base + "-" + System.currentTimeMillis();
                break;
            }
        }
        return slug;
    }

    private String uniqueSlugExcludingId(String base, Long excludeCategoryId) {
        String slug = base;
        int n = 0;
        while (categoryRepository.existsBySlugAndIdNotAndDeletedAtIsNull(slug, excludeCategoryId)) {
            n++;
            slug = base + "-" + n;
            if (n > 1000) {
                slug = base + "-" + System.currentTimeMillis();
                break;
            }
        }
        return slug;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Category> findAll(String deletedFilter) {
        String f = deletedFilter == null ? "active" : deletedFilter.trim().toLowerCase(Locale.ROOT);
        if ("deleted".equals(f)) {
            return categoryRepository.findAllByDeletedAtIsNotNull();
        }
        if ("all".equals(f)) {
            return categoryRepository.findAll();
        }
        return categoryRepository.findAllByDeletedAtIsNull();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Category> findAll() {
        return findAll("active");
    }

    @Override
    @Transactional(readOnly = true)
    public Category findById(Long id) {
        return categoryRepository.findByIdAndDeletedAtIsNull(id).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByNameIgnoreCase(String name) {
        return categoryRepository.existsByNameIgnoreCaseAndDeletedAtIsNull(name);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByNameIgnoreCaseAndIdNot(String name, Long id) {
        return categoryRepository.existsByNameIgnoreCaseAndIdNotAndDeletedAtIsNull(name, id);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDeletePreview getDeletePreview(Long id) {
        Category cat = categoryRepository.findByIdAndDeletedAtIsNull(id).orElse(null);
        if (cat == null) {
            return null;
        }
        long childCount = categoryRepository.countByParentIdAndDeletedAtIsNull(id);
        long productCount = productRepository.countLinkedToCategory(id);
        return new CategoryDeletePreview(id, cat.getName(), cat.getSlug(), productCount, childCount);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> listProductsLinkedToCategory(Long categoryId) {
        return categoryRepository.findByIdAndDeletedAtIsNull(categoryId)
                .map(cat -> productRepository.findAllLinkedToCategory(categoryId))
                .orElse(Collections.emptyList());
    }

    @Override
    public void deleteById(Long id, boolean confirmDeleteWithProducts, String actorUsername, String actorUserId) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found"));
        if (cat.getDeletedAt() != null) {
            throw new IllegalArgumentException("already deleted");
        }
        long childCount = categoryRepository.countByParentIdAndDeletedAtIsNull(id);
        if (childCount > 0) {
            log.warn("Từ chối xóa danh mục id={}: còn {} danh mục con", id, childCount);
            throw new CategoryHasChildCategoriesException(childCount);
        }
        long productCount = productRepository.countLinkedToCategory(id);
        if (productCount > 0 && !confirmDeleteWithProducts) {
            log.warn("Xóa danh mục id={} cần xác nhận — còn {} sản phẩm liên quan", id, productCount);
            throw new CategoryDeletionRequiresConfirmationException(productCount);
        }
        String name = cat.getName();
        String slug = cat.getSlug();
        String actor = (actorUsername != null && !actorUsername.trim().isEmpty())
                ? actorUsername.trim()
                : "system";
        String uid = normUserId(actorUserId);
        cat.setDeletedAt(LocalDateTime.now());
        cat.setDeletedBy(actor);
        cat.setDeletedByUserId(uid);
        cat.setHidden(Boolean.TRUE);
        cat.setUpdatedBy(actor);
        cat.setUpdatedByUserId(uid);
        categoryRepository.save(cat);
        int hiddenProducts = productRepository.updateHiddenByCategory(id, Boolean.TRUE);
        log.info("Đã xóa mềm danh mục id={}, name={}, hiddenProducts={}, actor={}, actorUserId={}",
                id, name, hiddenProducts, actorUsername, actorUserId);
        sendDeleteActivityLog(id, name, slug, productCount, confirmDeleteWithProducts, actorUsername, actorUserId);
    }

    private void sendDeleteActivityLog(
            Long categoryId,
            String name,
            String slug,
            long productCount,
            boolean confirmForced,
            String actorUsername,
            String actorUserId) {
        try {
            Map<String, Object> before = new LinkedHashMap<>();
            before.put("categoryId", categoryId);
            before.put("name", name);
            before.put("slug", slug);

            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("schemaVersion", 2);
            detail.put("resourceType", "Category");
            detail.put("categoryId", categoryId);
            detail.put("before", before);
            detail.put("categoryName", name);
            detail.put("slug", slug);
            detail.put("productCountAtDelete", productCount);
            detail.put("confirmDeleteWithProducts", confirmForced);
            detail.put("deletedAt", Instant.now().toString());
            detail.put("deletedByUsername", actorUsername != null && !actorUsername.trim().isEmpty()
                    ? actorUsername.trim() : "system");
            detail.put("deletedByUserId", actorUserId != null && !actorUserId.trim().isEmpty()
                    ? actorUserId.trim() : null);
            detail.put("softDelete", true);
            detail.put("restorableCategoryId", categoryId);

            ActivityLogRequest req = new ActivityLogRequest();
            req.setAction("CATEGORY_DELETE");
            req.setResourceType("Category");
            req.setResourceId(String.valueOf(categoryId));
            req.setHttpMethod("DELETE");
            req.setRequestPath("/admin/categories/" + categoryId);
            req.setActorUsername(actorUsername != null ? actorUsername.trim() : null);
            req.setActorUserId(actorUserId != null ? actorUserId.trim() : null);
            String performedBy = actorUsername != null && !actorUsername.trim().isEmpty()
                    ? actorUsername.trim() : "system";
            req.setPerformedBy(performedBy);
            req.setDetailJson(objectMapper.writeValueAsString(detail));
            activityLogFeignClient.log(req);
        } catch (Exception e) {
            log.warn("Không ghi activity log khi xóa danh mục id={}: {}", categoryId, e.toString());
        }
    }
}
