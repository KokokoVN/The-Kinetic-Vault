package com.rainbowforest.productcatalogservice.service;

import io.minio.*;
import io.minio.http.Method;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * MinioService — Dịch vụ lưu trữ ảnh sản phẩm lên MinIO Object Storage.
 *
 * Thay thế giải pháp lưu trữ local filesystem (uploads/product-images/).
 * MinIO tương thích AWS S3 API, chạy self-hosted.
 *
 * Chỉ kích hoạt khi minio.enabled=true trong application.properties.
 *
 * Cách sử dụng:
 *   String publicUrl = minioService.uploadProductImage(file, productId);
 *   minioService.deleteObject("product-images/abc123.jpg");
 */
@Service
@ConditionalOnProperty(name = "minio.enabled", havingValue = "true", matchIfMissing = false)
public class MinioService {

    private static final Logger log = LoggerFactory.getLogger(MinioService.class);

    @Autowired
    private MinioClient minioClient;

    @Value("${minio.bucket:product-images}")
    private String bucketName;

    @Value("${minio.endpoint:http://localhost:9000}")
    private String endpoint;

    /**
     * Tự động tạo bucket nếu chưa tồn tại khi service khởi động.
     */
    @PostConstruct
    public void ensureBucketExists() {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("[MinIO] Đã tạo bucket mới: {}", bucketName);
            } else {
                log.info("[MinIO] Bucket '{}' đã tồn tại.", bucketName);
            }
        } catch (Exception e) {
            log.error("[MinIO] Không thể kiểm tra/tạo bucket: {}", e.getMessage());
        }
    }

    /**
     * Upload ảnh sản phẩm lên MinIO và trả về URL công khai.
     *
     * @param file File ảnh từ multipart upload
     * @param productId ID sản phẩm (dùng làm prefix trong đường dẫn)
     * @return URL công khai để truy cập ảnh
     */
    public String uploadProductImage(MultipartFile file, Long productId) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File upload không hợp lệ");
        }

        String originalFilename = file.getOriginalFilename() != null
                ? file.getOriginalFilename()
                : "image.jpg";
        String extension = originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";

        // Tạo tên file duy nhất: product-images/productId/uuid.ext
        String objectName = "products/" + productId + "/" + UUID.randomUUID() + extension;
        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(contentType)
                            .build()
            );
        }

        // Tạo pre-signed URL public (7 ngày)
        String url = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(bucketName)
                        .object(objectName)
                        .expiry(7, TimeUnit.DAYS)
                        .build()
        );

        log.info("[MinIO] Đã upload ảnh productId={}, object={}, url={}", productId, objectName, url);
        return url;
    }

    /**
     * Upload file từ InputStream (không có tên file gốc).
     */
    public String uploadFromStream(InputStream inputStream, long size, String objectName, String contentType) throws Exception {
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .stream(inputStream, size, -1)
                        .contentType(contentType)
                        .build()
        );
        return endpoint + "/" + bucketName + "/" + objectName;
    }

    /**
     * Xóa một object khỏi MinIO.
     *
     * @param objectName Tên object cần xóa (vd: "products/1/abc123.jpg")
     */
    public void deleteObject(String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
            log.info("[MinIO] Đã xóa object: {}", objectName);
        } catch (Exception e) {
            log.warn("[MinIO] Không thể xóa object={}: {}", objectName, e.getMessage());
        }
    }

    /**
     * Kiểm tra MinIO đang hoạt động không.
     */
    public boolean isHealthy() {
        try {
            minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
