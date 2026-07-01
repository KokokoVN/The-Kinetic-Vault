package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.dto.CategoryDeletePreview;
import com.rainbowforest.productcatalogservice.entity.Category;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.exception.CategoryDeletionRequiresConfirmationException;
import com.rainbowforest.productcatalogservice.exception.CategoryHasChildCategoriesException;
import com.rainbowforest.productcatalogservice.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/categories")
public class AdminCategoryController {

    private final CategoryService categoryService;

    public AdminCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Category category,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            Category saved = categoryService.save(category, username, userId);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            if (CategoryService.DUPLICATE_NAME.equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "error", "DUPLICATE_NAME",
                                "message", "Tên danh mục đã tồn tại (không phân biệt hoa thường)."));
            }
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Bad request"));
        }
    }

    @GetMapping
    public ResponseEntity<List<Category>> list(
            @RequestParam(value = "deleted", defaultValue = "active") String deleted) {
        return ResponseEntity.ok(categoryService.findAll(deleted));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> one(@PathVariable Long id) {
        Category c = categoryService.findById(id);
        if (c == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(c);
    }

    /** Kiểm tra trùng tên danh mục khi nhập form create/edit. */
    @GetMapping("/check-name")
    public ResponseEntity<Map<String, Object>> checkName(
            @RequestParam("name") String name,
            @RequestParam(value = "excludeId", required = false) Long excludeId) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            return ResponseEntity.ok(Map.of("exists", false));
        }
        boolean exists = (excludeId != null && excludeId > 0)
                ? categoryService.existsByNameIgnoreCaseAndIdNot(trimmed, excludeId)
                : categoryService.existsByNameIgnoreCase(trimmed);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    /** Sản phẩm thuộc danh mục (theo category_id hoặc tên text legacy). */
    @GetMapping("/{id}/products")
    public ResponseEntity<List<Product>> productsForCategory(@PathVariable Long id) {
        if (categoryService.findById(id) == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(categoryService.listProductsLinkedToCategory(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Category body,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            Category saved = categoryService.update(id, body, username, userId);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            if ("not found".equals(e.getMessage())) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            if (CategoryService.DUPLICATE_NAME.equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "error", "DUPLICATE_NAME",
                                "message", "Tên danh mục đã tồn tại (không phân biệt hoa thường)."));
            }
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Bad request"));
        }
    }

    /** Khôi phục danh mục đã xóa mềm (cùng id). */
    @PostMapping("/{id}/restore")
    public ResponseEntity<?> restore(
            @PathVariable Long id,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            Category saved = categoryService.restore(id, username, userId);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            if ("not found".equals(e.getMessage())) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            if ("not deleted".equals(e.getMessage())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Danh mục chưa bị xóa, không cần khôi phục."));
            }
            if (CategoryService.DUPLICATE_NAME.equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "error", "DUPLICATE_NAME",
                                "message", "Đã có danh mục đang hoạt động trùng tên — đổi tên bản đang xóa hoặc xóa bản trùng trước."));
            }
            if (CategoryService.DUPLICATE_SLUG.equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "error", "DUPLICATE_SLUG",
                                "message", "Slug đã được danh mục khác dùng — sửa slug trước khi khôi phục."));
            }
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Bad request"));
        }
    }

    /** Xem số sản phẩm / danh mục con trước khi xóa (không thay đổi dữ liệu). */
    @GetMapping("/{id}/delete-preview")
    public ResponseEntity<CategoryDeletePreview> deletePreview(@PathVariable Long id) {
        CategoryDeletePreview preview = categoryService.getDeletePreview(id);
        if (preview == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(preview);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean confirm,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            categoryService.deleteById(id, confirm, username, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            if ("not found".equals(e.getMessage())) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            if ("already deleted".equals(e.getMessage())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Danh mục đã được xóa trước đó."));
            }
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (CategoryHasChildCategoriesException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "HAS_CHILD_CATEGORIES",
                    "childCategoryCount", e.getChildCategoryCount(),
                    "message", "Còn danh mục con. Xóa hoặc gỡ danh mục con trước."));
        } catch (CategoryDeletionRequiresConfirmationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "REQUIRES_CONFIRMATION",
                    "productCount", e.getProductCount(),
                    "message", "Danh mục còn sản phẩm liên quan. Gửi lại DELETE với confirm=true sau khi người dùng xác nhận."));
        }
    }
}
