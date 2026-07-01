package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.dto.ProductUpsertRequest;
import com.rainbowforest.productcatalogservice.entity.Brand;
import com.rainbowforest.productcatalogservice.entity.Category;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.entity.ProductChangeLog;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.repository.BrandRepository;
import com.rainbowforest.productcatalogservice.repository.CategoryRepository;
import com.rainbowforest.productcatalogservice.repository.ProductChangeLogRepository;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminProductController {
    private static final Logger log = LoggerFactory.getLogger(AdminProductController.class);

    @Autowired
    private ProductService productService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductChangeLogRepository changeLogRepository;

    @GetMapping(value = "/products/{id}")
    public ResponseEntity<Product> getProductForAdmin(@PathVariable("id") Long id) {
        Product p = productService.getProductForAdminById(id);
        if (p == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(p, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @GetMapping(value = "/products")
    public ResponseEntity<List<Product>> listProducts(
            @RequestParam(value = "includeDeleted", required = false, defaultValue = "false") boolean includeDeleted) {
        List<Product> products = includeDeleted
                ? productRepository.findAllFetchedForAdminIncludeDeleted()
                : productRepository.findAllFetchedForAdmin();
        if (!products.isEmpty()) {
            return new ResponseEntity<>(
                    products,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products/paged")
    public ResponseEntity<org.springframework.data.domain.Page<Product>> getPagedProducts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "brandId", required = false) Long brandId,
            @RequestParam(value = "filterDeleted", defaultValue = "active") String filterDeleted,
            @RequestParam(value = "sortBy", defaultValue = "newest") String sortBy) {

        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.unsorted();
        if ("newest".equals(sortBy)) {
            sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id");
        } else if ("oldest".equals(sortBy)) {
            sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "id");
        } else if ("price_asc".equals(sortBy)) {
            sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "price");
        } else if ("price_desc".equals(sortBy)) {
            sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "price");
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, sort);
        org.springframework.data.jpa.domain.Specification<Product> spec = com.rainbowforest.productcatalogservice.repository.ProductSpecification.filterAdminProducts(q, categoryId, brandId, filterDeleted);

        org.springframework.data.domain.Page<Product> pagedResult = productRepository.findAll(spec, pageable);

        return new ResponseEntity<>(pagedResult, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @PostMapping(value = "/products/{id}/hide")
    public ResponseEntity<Product> hideProduct(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Product saved = productService.setProductHidden(id, true, username, userId);
        return new ResponseEntity<>(saved, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @PostMapping(value = "/products/{id}/unhide")
    public ResponseEntity<Product> unhideProduct(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Product saved = productService.setProductHidden(id, false, username, userId);
        return new ResponseEntity<>(saved, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @PostMapping(value = "/products")
    public ResponseEntity<Product> addProduct(
            @Valid @RequestBody ProductUpsertRequest body,
            HttpServletRequest request,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Product p = new Product();
        p.setProductName(body.getProductName());
        p.setDiscription(body.getDiscription());
        p.setPrice(body.getPrice());
        p.setAvailability(body.getAvailability());
        if (body.getSku() != null && !body.getSku().trim().isEmpty()) {
            p.setSku(body.getSku().trim());
        }

        // Gán Brand (tùy chọn)
        if (body.getBrandId() != null) {
            Brand brand = brandRepository.findById(body.getBrandId()).orElse(null);
            if (brand != null) {
                p.setBrand(brand);
            }
        }

        // Gán danh mục - ưu tiên categoryIds (ManyToMany), fallback về categoryId
        if (body.getCategoryIds() != null && !body.getCategoryIds().isEmpty()) {
            List<Category> cats = categoryRepository.findAllById(body.getCategoryIds());
            p.setCategories(cats);
            // Gán category_id (cột đơn) = category đầu tiên để tương thích ngược
            if (!cats.isEmpty()) {
                p.setCategoryEntity(cats.get(0));
            }
        } else if (body.getCategoryId() != null) {
            Category category = new Category();
            category.setId(body.getCategoryId());
            p.setCategoryEntity(category);
        }

        Product saved = productService.addProduct(p, username, userId);

        // Ghi nhật ký thay đổi cho sản phẩm mới tạo
        saveChangeLog(saved.getId(), "product_created",
                null, "name=" + saved.getProductName() + ", price=" + saved.getPrice(),
                username, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .headers(headerGenerator.getHeadersForSuccessPostMethod(request, saved.getId()))
                .body(saved);
    }

    @PutMapping(value = "/products/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable("id") Long id,
            @Valid @RequestBody ProductUpsertRequest body,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        // Snapshot trạng thái trước khi sửa để so sánh
        Product existing = productRepository.findById(id).orElse(null);
        String beforeSummary = existing != null
                ? "name=" + existing.getProductName() + ", price=" + existing.getPrice()
                  + ", brand=" + existing.getBrandId() + ", category=" + existing.getCategoryId()
                : null;

        Product patch = new Product();
        patch.setProductName(body.getProductName());
        patch.setDiscription(body.getDiscription());
        patch.setPrice(body.getPrice());
        patch.setAvailability(body.getAvailability());
        if (body.getSku() != null) {
            String s = body.getSku().trim();
            if (!s.isEmpty()) {
                patch.setSku(s);
            }
        }

        // Gán Brand (tùy chọn)
        if (body.getBrandId() != null) {
            Brand brand = brandRepository.findById(body.getBrandId()).orElse(null);
            patch.setBrand(brand);
        }

        // Gán danh mục
        if (body.getCategoryIds() != null && !body.getCategoryIds().isEmpty()) {
            List<Category> cats = categoryRepository.findAllById(body.getCategoryIds());
            patch.setCategories(cats);
            if (!cats.isEmpty()) {
                patch.setCategoryEntity(cats.get(0));
            }
        } else if (body.getCategoryId() != null) {
            Category category = new Category();
            category.setId(body.getCategoryId());
            patch.setCategoryEntity(category);
        }

        Product saved = productService.updateProduct(id, patch, username, userId);

        // Ghi nhật ký ProductChangeLog
        String afterSummary = "name=" + saved.getProductName() + ", price=" + saved.getPrice()
                + ", brand=" + saved.getBrandId() + ", category=" + saved.getCategoryId();
        saveChangeLog(id, "product_updated", beforeSummary, afterSummary, username, userId);

        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping(value = "/products/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        productService.deleteProduct(id, username, userId);
        saveChangeLog(id, "product_deleted", "active", "deleted", username, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/products/{id}/restore")
    public ResponseEntity<?> restoreProduct(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Product restored = productService.restoreProduct(id, username, userId);
        saveChangeLog(id, "product_restored", "deleted", "active", username, userId);
        return new ResponseEntity<>(restored, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
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
}
