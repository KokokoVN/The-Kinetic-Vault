package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.dto.ProductImageRequest;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.entity.ProductImage;
import com.rainbowforest.productcatalogservice.entity.ProductChangeLog;
import com.rainbowforest.productcatalogservice.repository.ProductChangeLogRepository;
import com.rainbowforest.productcatalogservice.client.ActivityLogFeignClient;
import com.rainbowforest.productcatalogservice.client.dto.ActivityLogRequest;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/products")
public class AdminProductCatalogController {
    private static final Logger log = LoggerFactory.getLogger(AdminProductCatalogController.class);

    private static Path getRootUploadPath(String subDir) {
        Path path = Paths.get(System.getProperty("user.dir"));
        if (path.getFileName().toString().endsWith("-service")) {
            path = path.getParent();
        }
        return path.resolve("uploads").resolve(subDir);
    }
    private static final Path PRODUCT_UPLOAD_DIR = getRootUploadPath("product-images");
    private final ProductRepository productRepository;
    private final ProductChangeLogRepository changeLogRepository;
    private final ActivityLogFeignClient activityLogFeignClient;
    private final ObjectMapper objectMapper;

    public AdminProductCatalogController(
            ProductRepository productRepository,
            ProductChangeLogRepository changeLogRepository,
            ActivityLogFeignClient activityLogFeignClient,
            ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.changeLogRepository = changeLogRepository;
        this.activityLogFeignClient = activityLogFeignClient;
        this.objectMapper = objectMapper;
    }

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

    @PostMapping("/{productId}/images")
    public ResponseEntity<ProductImage> addImage(
            @PathVariable Long productId,
            @Valid @RequestBody ProductImageRequest req,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Product p = productRepository.findByIdAdminFetched(productId).orElse(null);
        if (p == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        ProductImage img = new ProductImage();
        img.setProduct(p);
        img.setStoragePath(req.getStoragePath());
        img.setImageUrl(req.getImageUrl());
        img.setSortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0);
        String mType = req.getMediaType() != null && !req.getMediaType().trim().isEmpty()
                ? req.getMediaType().trim().toUpperCase() : "IMAGE";
        img.setMediaType(mType);
        boolean makePrimary = Boolean.TRUE.equals(req.getPrimaryImage()) || p.getImages().isEmpty();
        if (makePrimary) {
            for (ProductImage it : p.getImages()) {
                it.setPrimaryImage(false);
            }
        }
        img.setPrimaryImage(makePrimary);

        String actor = username != null && !username.trim().isEmpty() ? username.trim()
                : (req.getPerformedBy() != null ? req.getPerformedBy().trim() : "system");
        String actorId = userId != null && !userId.trim().isEmpty() ? userId.trim() : null;

        img.setCreatedBy(actor);
        img.setUpdatedBy(actor);

        p.getImages().add(img);
        productRepository.save(p);

        saveChangeLog(productId,
                "media_added",
                null,
                "url=" + img.getImageUrl() + ", type=" + img.getMediaType(),
                actor, actorId);

        sendImageLog("PRODUCT_IMAGE_CREATE", "POST", "/admin/products/" + productId + "/images", img, actor, actorId);
        return new ResponseEntity<>(img, HttpStatus.CREATED);
    }

    @PostMapping(value = "/{productId}/images/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImages(
            @PathVariable Long productId,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "primaryIndex", required = false) Integer primaryIndex,
            @RequestParam(value = "performedBy", required = false) String performedBy,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Product p = productRepository.findByIdAdminFetched(productId).orElse(null);
        if (p == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cần chọn ít nhất 1 file ảnh"));
        }
        String actor = username != null && !username.trim().isEmpty() ? username.trim()
                : (performedBy != null ? performedBy.trim() : "system");
        String actorId = userId != null && !userId.trim().isEmpty() ? userId.trim() : null;

        try {
            Files.createDirectories(PRODUCT_UPLOAD_DIR);
            int startSort = p.getImages().stream().mapToInt(ProductImage::getSortOrder).max().orElse(0) + 1;
            boolean hasPrimary = !p.getImages().isEmpty() && p.getImages().stream().anyMatch(ProductImage::isPrimaryImage);
            
            // Xử lý song song bằng IntStream.range().parallel() để tăng tốc độ ghi đĩa
            List<ProductImage> uploadedImages = java.util.stream.IntStream.range(0, files.size())
                    .parallel()
                    .mapToObj(i -> {
                        MultipartFile f = files.get(i);
                        if (f == null || f.isEmpty()) return null;
                        
                        try {
                            String original = f.getOriginalFilename() != null ? f.getOriginalFilename() : "image";
                            String ext = "";
                            int dot = original.lastIndexOf('.');
                            if (dot >= 0 && dot < original.length() - 1) {
                                ext = original.substring(dot);
                            }
                            String filename = UUID.randomUUID().toString().replace("-", "") + ext;
                            Path out = PRODUCT_UPLOAD_DIR.resolve(filename);
                            f.transferTo(out.toAbsolutePath().toFile());

                            ProductImage img = new ProductImage();
                            img.setProduct(p);
                            img.setStoragePath(filename);
                            img.setImageUrl("/api/catalog/admin/products/images/file/" + filename);
                            img.setSortOrder(startSort + i);

                            boolean isVideo = false;
                            if (f.getContentType() != null && f.getContentType().startsWith("video/")) {
                                isVideo = true;
                            } else {
                                String extLower = ext.toLowerCase();
                                if (extLower.equals(".mp4") || extLower.equals(".avi") || extLower.equals(".mov") ||
                                    extLower.equals(".webm") || extLower.equals(".mkv") || extLower.equals(".3gp") ||
                                    extLower.equals(".flv")) {
                                    isVideo = true;
                                }
                            }
                            img.setMediaType(isVideo ? "VIDEO" : "IMAGE");

                            boolean makePrimary = primaryIndex != null && primaryIndex == i;
                            img.setPrimaryImage(makePrimary);
                            img.setCreatedBy(actor);
                            img.setUpdatedBy(actor);
                            
                            return img;
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    })
                    .filter(img -> img != null)
                    .collect(java.util.stream.Collectors.toList());

            int validCount = uploadedImages.size();
            
            if (validCount > 0) {
                boolean anyRequestedPrimary = uploadedImages.stream().anyMatch(ProductImage::isPrimaryImage);
                if (!hasPrimary && !anyRequestedPrimary) {
                    uploadedImages.get(0).setPrimaryImage(true);
                    anyRequestedPrimary = true;
                }
                
                if (anyRequestedPrimary) {
                    for (ProductImage it : p.getImages()) {
                        it.setPrimaryImage(false);
                    }
                }
                p.getImages().addAll(uploadedImages);
            }
            productRepository.save(p);

            saveChangeLog(productId,
                    "media_uploaded",
                    null,
                    "count=" + validCount,
                    actor, actorId);

            sendImageBulkUploadLog(productId, validCount, actor);
            return ResponseEntity.ok(Map.of("uploaded", true));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Không upload được ảnh", "error", e.getMessage()));
        }
    }

    @GetMapping("/images/file/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            Path filePath = PRODUCT_UPLOAD_DIR.resolve(filename).normalize();
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

    @GetMapping("/{productId}/images")
    public ResponseEntity<List<ProductImage>> listImages(@PathVariable Long productId) {
        Product p = productRepository.findByIdAdminFetched(productId).orElse(null);
        if (p == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        p.getImages().sort(Comparator.comparingInt(ProductImage::getSortOrder)
                .thenComparing(img -> img.getId() != null ? img.getId() : 0L));
        return ResponseEntity.ok(p.getImages());
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    public ResponseEntity<?> deleteImage(
            @PathVariable Long productId,
            @PathVariable Long imageId,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Product p = productRepository.findByIdAdminFetched(productId).orElse(null);
        if (p == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        ProductImage target = null;
        for (ProductImage it : p.getImages()) {
            if (it.getId() != null && it.getId().equals(imageId)) {
                target = it;
                break;
            }
        }
        if (target == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        boolean wasPrimary = target.isPrimaryImage();
        ProductImage removed = target;
        p.getImages().remove(target);
        if (wasPrimary && !p.getImages().isEmpty()) {
            p.getImages().get(0).setPrimaryImage(true);
        }
        productRepository.save(p);

        // Xóa file vật lý khỏi ổ cứng
        String filenameToDelete = removed.getStoragePath();
        if (filenameToDelete == null || filenameToDelete.trim().isEmpty()) {
            String url = removed.getImageUrl();
            if (url != null && url.contains("/images/file/")) {
                filenameToDelete = url.substring(url.lastIndexOf("/images/file/") + 13);
            }
        }

        if (filenameToDelete != null && !filenameToDelete.trim().isEmpty()) {
            try {
                Path filePath = PRODUCT_UPLOAD_DIR.resolve(filenameToDelete).normalize();
                Files.deleteIfExists(filePath);
                log.info("Deleted physical file: {}", filePath);
            } catch (Exception e) {
                log.warn("Không thể xóa file vật lý: {}", filenameToDelete, e);
            }
        }

        String actor = username != null && !username.trim().isEmpty() ? username.trim() : "system";
        String actorId = userId != null && !userId.trim().isEmpty() ? userId.trim() : null;

        saveChangeLog(productId,
                "media_deleted[" + imageId + "]",
                "url=" + removed.getImageUrl() + ", type=" + removed.getMediaType(),
                null,
                actor, actorId);

        sendImageDeleteLog(productId, imageId, removed, actor, actorId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{productId}/images/{imageId}/primary")
    public ResponseEntity<?> setPrimary(
            @PathVariable Long productId,
            @PathVariable Long imageId,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Product p = productRepository.findByIdAdminFetched(productId).orElse(null);
        if (p == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        ProductImage target = null;
        for (ProductImage it : p.getImages()) {
            if (it.getId() != null && it.getId().equals(imageId)) {
                target = it;
                break;
            }
        }
        if (target == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        for (ProductImage it : p.getImages()) {
            it.setPrimaryImage(it == target);
        }
        productRepository.save(p);

        String actor = username != null && !username.trim().isEmpty() ? username.trim() : "system";
        String actorId = userId != null && !userId.trim().isEmpty() ? userId.trim() : null;

        saveChangeLog(productId,
                "media_set_primary[" + imageId + "]",
                "primary=false",
                "primary=true",
                actor, actorId);

        sendImageLog("PRODUCT_IMAGE_SET_PRIMARY", "PUT", "/admin/products/" + productId + "/images/" + imageId + "/primary", target, actor, actorId);
        return ResponseEntity.ok(target);
    }

    // product_discounts đã bỏ theo yêu cầu
    private void sendImageLog(String action, String method, String path, ProductImage image, String actorUsername, String actorUserId) {
        try {
            Map<String, Object> after = new LinkedHashMap<>();
            after.put("imageId", image.getId());
            after.put("productId", image.getProduct() != null ? image.getProduct().getId() : null);
            after.put("storagePath", image.getStoragePath());
            after.put("imageUrl", image.getImageUrl());
            after.put("sortOrder", image.getSortOrder());
            after.put("primaryImage", image.isPrimaryImage());
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("resourceType", "ProductImage");
            detail.put("after", after);
            ActivityLogRequest req = new ActivityLogRequest();
            req.setAction(action);
            req.setResourceType("ProductImage");
            req.setResourceId(String.valueOf(image.getId()));
            req.setHttpMethod(method);
            req.setRequestPath(path);
            req.setActorUsername(actorUsername);
            req.setActorUserId(actorUserId);
            req.setPerformedBy(actorUsername != null && !actorUsername.trim().isEmpty() ? actorUsername.trim() : "system");
            req.setDetailJson(objectMapper.writeValueAsString(detail));
            activityLogFeignClient.log(req);
        } catch (Exception e) {
            log.warn("Không ghi activity log {} imageId={}: {}", action, image != null ? image.getId() : null, e.toString());
        }
    }

    private void sendImageDeleteLog(Long productId, Long imageId, ProductImage image, String actorUsername, String actorUserId) {
        try {
            Map<String, Object> before = new LinkedHashMap<>();
            before.put("imageId", imageId);
            before.put("productId", productId);
            before.put("storagePath", image != null ? image.getStoragePath() : null);
            before.put("imageUrl", image != null ? image.getImageUrl() : null);
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("resourceType", "ProductImage");
            detail.put("before", before);
            ActivityLogRequest req = new ActivityLogRequest();
            req.setAction("PRODUCT_IMAGE_DELETE");
            req.setResourceType("ProductImage");
            req.setResourceId(String.valueOf(imageId));
            req.setHttpMethod("DELETE");
            req.setRequestPath("/admin/products/" + productId + "/images/" + imageId);
            req.setActorUsername(actorUsername);
            req.setActorUserId(actorUserId);
            req.setPerformedBy(actorUsername != null && !actorUsername.trim().isEmpty() ? actorUsername.trim() : "system");
            req.setDetailJson(objectMapper.writeValueAsString(detail));
            activityLogFeignClient.log(req);
        } catch (Exception e) {
            log.warn("Không ghi activity log PRODUCT_IMAGE_DELETE imageId={}: {}", imageId, e.toString());
        }
    }

    private void sendImageBulkUploadLog(Long productId, int uploadCount, String actorUsername) {
        try {
            Map<String, Object> after = new LinkedHashMap<>();
            after.put("productId", productId);
            after.put("uploadCount", uploadCount);
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("resourceType", "ProductImage");
            detail.put("after", after);
            ActivityLogRequest req = new ActivityLogRequest();
            req.setAction("PRODUCT_IMAGE_UPLOAD");
            req.setResourceType("ProductImage");
            req.setResourceId(String.valueOf(productId));
            req.setHttpMethod("POST");
            req.setRequestPath("/admin/products/" + productId + "/images/upload");
            req.setActorUsername(actorUsername);
            req.setPerformedBy(actorUsername != null && !actorUsername.trim().isEmpty() ? actorUsername.trim() : "system");
            req.setDetailJson(objectMapper.writeValueAsString(detail));
            activityLogFeignClient.log(req);
        } catch (Exception e) {
            log.warn("Không ghi activity log PRODUCT_IMAGE_UPLOAD productId={}: {}", productId, e.toString());
        }
    }
}
