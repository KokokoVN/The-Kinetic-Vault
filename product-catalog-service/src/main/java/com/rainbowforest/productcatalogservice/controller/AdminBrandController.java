package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Brand;
import com.rainbowforest.productcatalogservice.service.BrandService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.rainbowforest.productcatalogservice.repository.BrandRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
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

    private static final Path BRAND_UPLOAD_DIR = Paths.get("uploads", "brand-logos");
    private final BrandService brandService;
    private final BrandRepository brandRepository;

    public AdminBrandController(BrandService brandService, BrandRepository brandRepository) {
        this.brandService = brandService;
        this.brandRepository = brandRepository;
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Brand brand,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            Brand saved = brandService.addBrand(brand, username, userId);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            if ("DUPLICATE_BRAND_NAME".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "error", "DUPLICATE_BRAND_NAME",
                        "message", "Tên thương hiệu đã tồn tại."
                ));
            }
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Brand brand,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            Brand saved = brandService.updateBrand(id, brand, username, userId);
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
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            brandService.deleteBrand(id, username, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            if ("Brand not found".equals(e.getMessage())) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Brand brand = brandService.getBrandById(id);
        if (brand == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(brand);
    }

    @GetMapping("/check-name")
    public ResponseEntity<?> checkName(@RequestParam String name) {
        boolean exists = brandRepository.existsByNameIgnoreCase(name);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

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
