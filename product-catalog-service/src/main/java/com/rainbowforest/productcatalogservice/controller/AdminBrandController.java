package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.dto.BrandResponseDto;
import com.rainbowforest.productcatalogservice.entity.Brand;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.service.BrandService;
import com.rainbowforest.productcatalogservice.repository.BrandRepository;
import com.rainbowforest.productcatalogservice.client.ActivityLogFeignClient;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/brands")
public class AdminBrandController {

    private static Path getRootUploadPath(String subDir) {
        Path path = Paths.get(System.getProperty("user.dir"));
        if (path.getFileName().toString().endsWith("-service")) {
            path = path.getParent();
        }
        return path.resolve("uploads").resolve(subDir);
    }

    private static final Path BRAND_UPLOAD_DIR = getRootUploadPath("brand-logos");
    private final BrandService brandService;
    private final BrandRepository brandRepository;
    private final ActivityLogFeignClient activityLogFeignClient;

    public AdminBrandController(BrandService brandService, BrandRepository brandRepository, ActivityLogFeignClient activityLogFeignClient) {
        this.brandService = brandService;
        this.brandRepository = brandRepository;
        this.activityLogFeignClient = activityLogFeignClient;
    }

    private void sendBrandLog(String action, String method, String path, Brand brand, Long brandId, String username, String userId) {
        if (activityLogFeignClient == null) return;
        try {
            Map<String, Object> detail = new java.util.LinkedHashMap<>();
            detail.put("resourceType", "Brand");
            if (brand != null) {
                detail.put("after", brand);
            }
            com.rainbowforest.productcatalogservice.client.dto.ActivityLogRequest req = new com.rainbowforest.productcatalogservice.client.dto.ActivityLogRequest();
            req.setAction(action);
            req.setResourceType("Brand");
            req.setResourceId(String.valueOf(brandId != null ? brandId : (brand != null ? brand.getId() : "0")));
            req.setHttpMethod(method);
            req.setRequestPath(path);
            req.setActorUsername(username);
            req.setActorUserId(userId);
            req.setPerformedBy(username != null && !username.trim().isEmpty() ? username.trim() : "admin");
            req.setDetailJson(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(detail));
            activityLogFeignClient.log(req);
        } catch (Exception ignored) {}
    }

    /** GET /admin/brands — danh sách thương hiệu (active / deleted / all). */
    @GetMapping
    public ResponseEntity<List<BrandResponseDto>> list(
            @RequestParam(value = "deleted", defaultValue = "active") String deleted) {
        return ResponseEntity.ok(brandService.getAllBrandDtos(deleted));
    }

    /** GET /admin/brands/paged — phân trang danh sách thương hiệu kèm tìm kiếm và sắp xếp. */
    @GetMapping("/paged")
    public ResponseEntity<Page<BrandResponseDto>> listPaged(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "deleted", defaultValue = "active") String deleted,
            @RequestParam(value = "sortBy", defaultValue = "newest") String sortBy) {
        return ResponseEntity.ok(brandService.getAdminBrandsPaged(page, size, q, deleted, sortBy));
    }

    /** GET /admin/brands/{id} — chi tiết thương hiệu kèm số lượng sản phẩm. */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        BrandResponseDto dto = brandService.getBrandDtoById(id);
        if (dto == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(dto);
    }

    /** GET /admin/brands/{id}/products — danh sách sản phẩm thuộc thương hiệu. */
    @GetMapping("/{id}/products")
    public ResponseEntity<?> getProductsByBrand(@PathVariable Long id) {
        Brand brand = brandService.getBrandById(id);
        if (brand == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        List<Product> products = brandService.getBrandProducts(id);
        return ResponseEntity.ok(products);
    }

    /** POST /admin/brands — tạo thương hiệu mới. */
    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Brand brand,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            Brand saved = brandService.addBrand(brand, username, userId);
            sendBrandLog("BRAND_CREATE", "POST", "/admin/brands", saved, saved.getId(), username, userId);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            if ("DUPLICATE_BRAND_NAME".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "error", "DUPLICATE_BRAND_NAME",
                        "message", "Tên thương hiệu đã tồn tại."
                ));
            }
            return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", "Dữ liệu không hợp lệ"));
        }
    }

    /** PUT /admin/brands/{id} — cập nhật thông tin thương hiệu. */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Brand brand,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            Brand saved = brandService.updateBrand(id, brand, username, userId);
            sendBrandLog("BRAND_UPDATE", "PUT", "/admin/brands/" + id, saved, id, username, userId);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            if ("Brand not found".equals(e.getMessage())) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            if ("DUPLICATE_BRAND_NAME".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "error", "DUPLICATE_BRAND_NAME",
                        "message", "Tên thương hiệu đã tồn tại."
                ));
            }
            return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", "Dữ liệu không hợp lệ"));
        }
    }

    /** DELETE /admin/brands/{id} — xóa mềm thương hiệu. */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            brandService.deleteBrand(id, username, userId);
            sendBrandLog("BRAND_DELETE", "DELETE", "/admin/brands/" + id, null, id, username, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            if ("Brand not found".equals(e.getMessage())) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", "Dữ liệu không hợp lệ"));
        }
    }

    /** PUT /admin/brands/{id}/restore — khôi phục thương hiệu đã xóa mềm. */
    @PutMapping("/{id}/restore")
    public ResponseEntity<?> restore(
            @PathVariable Long id,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            Brand restored = brandService.restoreBrand(id, username, userId);
            sendBrandLog("BRAND_RESTORE", "PUT", "/admin/brands/" + id + "/restore", restored, id, username, userId);
            return ResponseEntity.ok(restored);
        } catch (IllegalArgumentException e) {
            if ("Brand not found".equals(e.getMessage())) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", "Dữ liệu không hợp lệ"));
        }
    }

    /** GET /admin/brands/check-name — kiểm tra trùng tên thương hiệu. */
    @GetMapping("/check-name")
    public ResponseEntity<?> checkName(
            @RequestParam String name,
            @RequestParam(required = false) Long excludeId) {
        boolean exists = (excludeId != null && excludeId > 0)
                ? brandRepository.existsByNameIgnoreCaseAndIdNot(name.trim(), excludeId)
                : brandRepository.existsByNameIgnoreCase(name.trim());
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    /** GET /admin/brands/check-slug — kiểm tra trùng slug thương hiệu. */
    @GetMapping("/check-slug")
    public ResponseEntity<?> checkSlug(
            @RequestParam String slug,
            @RequestParam(required = false) Long excludeId) {
        boolean exists = (excludeId != null && excludeId > 0)
                ? brandRepository.existsBySlugIgnoreCaseAndIdNot(slug.trim(), excludeId)
                : brandRepository.existsBySlugIgnoreCase(slug.trim());
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    /** POST /admin/brands/upload-logo — tải lên logo thương hiệu. */
    @PostMapping(value = "/upload-logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadLogo(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
        }
        try {
            Files.createDirectories(BRAND_UPLOAD_DIR);
            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "logo";
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot >= 0 && dot < original.length() - 1) {
                ext = original.substring(dot);
            }
            String filename = UUID.randomUUID().toString().replace("-", "") + ext;
            Path out = BRAND_UPLOAD_DIR.resolve(filename);
            Files.copy(file.getInputStream(), out, StandardCopyOption.REPLACE_EXISTING);

            String url = "/api/catalog/admin/brands/logos/" + filename;
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload logo", "error", e.getMessage()));
        }
    }

    /** GET /admin/brands/logos/{filename} — phục vụ file logo. */
    @GetMapping("/logos/{filename:.+}")
    public ResponseEntity<Resource> serveLogo(@PathVariable String filename) {
        try {
            Path filePath = BRAND_UPLOAD_DIR.resolve(filename).normalize();
            if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            Resource resource = new UrlResource(filePath.toUri());
            String type = Files.probeContentType(filePath);
            MediaType mt = type != null ? MediaType.parseMediaType(type) : MediaType.APPLICATION_OCTET_STREAM;
            return ResponseEntity.ok().contentType(mt).body(resource);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
