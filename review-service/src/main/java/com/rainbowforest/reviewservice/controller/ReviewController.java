package com.rainbowforest.reviewservice.controller;

import com.rainbowforest.reviewservice.dto.ReviewRequest;
import com.rainbowforest.reviewservice.dto.ReviewResponseDto;
import com.rainbowforest.reviewservice.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final com.rainbowforest.reviewservice.client.ActivityLogFeignClient activityLogFeignClient;

    /** Whitelist extension cho review media. */
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp", ".mp4");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    private static final int MAX_FILES_PER_REQUEST = 10;

    /** Magic bytes để kiểm tra file type thực sự. */
    private static final byte[] JPEG_MAGIC = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] PNG_MAGIC = {(byte) 0x89, 0x50, 0x4E, 0x47};
    private static final byte[] WEBP_MAGIC_RIFF = {'R', 'I', 'F', 'F'};
    private static final byte[] WEBP_MAGIC_WEBP = {'W', 'E', 'B', 'P'};
    private static final byte[] MP4_MAGIC_FTYP = {'f', 't', 'y', 'p'};

    private static Path getRootUploadPath(String subDir) {
        Path path = Paths.get(System.getProperty("user.dir"));
        if (path.getFileName().toString().endsWith("-service")) {
            path = path.getParent();
        }
        return path.resolve("uploads").resolve(subDir).toAbsolutePath().normalize();
    }

    private static final Path REVIEW_MEDIA_DIR = getRootUploadPath("review-media");

    @PostMapping
    public ResponseEntity<ReviewResponseDto> createReview(@RequestHeader(value = "X-User-Id", required = false) Long xUserId,
                                                          @RequestHeader(value = "userId", required = false) Long userIdHeader,
                                                          @RequestBody ReviewRequest request) {
        Long userId = xUserId != null ? xUserId : userIdHeader;
        if (userId == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        ReviewResponseDto dto = reviewService.createReview(userId, request);
        sendReviewActivityLog("REVIEW_CREATE", dto.getId(), "POST", "/reviews", dto, String.valueOf(userId));
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDto> editReview(@RequestHeader(value = "X-User-Id", required = false) Long xUserId,
                                                        @RequestHeader(value = "userId", required = false) Long userIdHeader,
                                                        @PathVariable Long reviewId,
                                                        @RequestBody ReviewRequest request) {
        Long userId = xUserId != null ? xUserId : userIdHeader;
        if (userId == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        ReviewResponseDto dto = reviewService.editReview(userId, reviewId, request);
        sendReviewActivityLog("REVIEW_UPDATE", dto.getId(), "PUT", "/reviews/" + reviewId, dto, String.valueOf(userId));
        return ResponseEntity.ok(dto);
    }

    private void sendReviewActivityLog(String action, Long reviewId, String method, String path, Object detailObj, String performedBy) {
        if (activityLogFeignClient == null) return;
        try {
            Map<String, Object> detail = new java.util.LinkedHashMap<>();
            detail.put("resourceType", "Review");
            detail.put("after", detailObj);

            Map<String, Object> logReq = new java.util.LinkedHashMap<>();
            logReq.put("action", action);
            logReq.put("resourceType", "Review");
            logReq.put("resourceId", String.valueOf(reviewId));
            logReq.put("httpMethod", method);
            logReq.put("requestPath", path);
            logReq.put("performedBy", performedBy != null ? performedBy : "user");
            logReq.put("detailJson", new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(detail));
            activityLogFeignClient.log(logReq);
        } catch (Exception ignored) {}
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    @GetMapping("/user")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByUser(@RequestHeader(value = "X-User-Id", required = false) Long xUserId,
                                                                    @RequestHeader(value = "userId", required = false) Long userIdHeader) {
        Long userId = xUserId != null ? xUserId : userIdHeader;
        if (userId == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        return ResponseEntity.ok(reviewService.getReviewsByUser(userId));
    }

    @PostMapping(value = "/media/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadReviewMedia(@RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không có file upload"));
        }
        if (files.length > MAX_FILES_PER_REQUEST) {
            return ResponseEntity.badRequest().body(Map.of("message", "Số lượng file vượt quá giới hạn"));
        }
        try {
            Files.createDirectories(REVIEW_MEDIA_DIR);

            List<String> urls = new ArrayList<>();
            List<String> errors = new ArrayList<>();

            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                try {
                    urls.add(saveValidFile(file));
                } catch (IllegalArgumentException ex) {
                    errors.add(ex.getMessage());
                }
            }

            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Một số file không hợp lệ", "errors", errors));
            }
            return ResponseEntity.ok(Map.of("uploaded", true, "urls", urls));
        } catch (Exception ex) {
            // Không trả message chi tiết cho client (tránh information disclosure)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Upload thất bại"));
        }
    }

    private String saveValidFile(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên file không hợp lệ");
        }

        // Lấy extension an toàn (chỉ phần sau dấu chấm cuối, lowercase).
        int dotIdx = originalName.lastIndexOf('.');
        if (dotIdx < 0 || dotIdx == originalName.length() - 1) {
            throw new IllegalArgumentException("File thiếu extension");
        }
        String ext = originalName.substring(dotIdx).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("Định dạng file không được hỗ trợ: " + ext);
        }

        // Kiểm tra kích thước theo loại.
        boolean isVideo = ".mp4".equals(ext);
        long maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File vượt quá dung lượng cho phép (" + (maxSize / (1024 * 1024)) + "MB)");
        }

        // Validate MIME type.
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("Không xác định được Content-Type");
        }
        String lowerCt = contentType.toLowerCase(Locale.ROOT);
        if (isVideo && !lowerCt.startsWith("video/")) {
            throw new IllegalArgumentException("MIME type không phải video");
        }
        if (!isVideo && !lowerCt.startsWith("image/")) {
            throw new IllegalArgumentException("MIME type không phải ảnh");
        }

        // Kiểm tra magic bytes để chống bypass extension.
        validateMagicBytes(file, ext);

        // Tạo tên file an toàn: UUID + ext đã whitelist
        String filename = UUID.randomUUID().toString() + ext;

        // Đảm bảo đường dẫn đích nằm trong thư mục cho phép (chống path traversal).
        Path target = REVIEW_MEDIA_DIR.resolve(filename).normalize();
        if (!target.startsWith(REVIEW_MEDIA_DIR)) {
            throw new IllegalArgumentException("Đường dẫn file không hợp lệ");
        }

        file.transferTo(target);
        return "/api/reviews/media/" + filename;
    }

    /**
     * Kiểm tra magic bytes để chống bypass extension (ví dụ shell.php.jpg).
     */
    private void validateMagicBytes(MultipartFile file, String ext) throws IOException {
        byte[] header = new byte[12];
        try (InputStream is = file.getInputStream()) {
            int total = 0;
            int read;
            while (total < header.length && (read = is.read(header, total, header.length - total)) != -1) {
                total += read;
            }
            header = Arrays.copyOf(header, total);
        }
        if (header.length < 4) {
            throw new IllegalArgumentException("File quá nhỏ hoặc không hợp lệ");
        }
        switch (ext) {
            case ".jpg":
            case ".jpeg":
                if (!startsWith(header, JPEG_MAGIC)) {
                    throw new IllegalArgumentException("Nội dung file không phải JPEG");
                }
                break;
            case ".png":
                if (!startsWith(header, PNG_MAGIC)) {
                    throw new IllegalArgumentException("Nội dung file không phải PNG");
                }
                break;
            case ".webp":
                if (!startsWith(header, WEBP_MAGIC_RIFF) || header.length < 12
                        || !startsWith(Arrays.copyOfRange(header, 8, 12), WEBP_MAGIC_WEBP)) {
                    throw new IllegalArgumentException("Nội dung file không phải WebP");
                }
                break;
            case ".mp4":
                if (header.length < 12 || !startsWith(Arrays.copyOfRange(header, 4, 8), MP4_MAGIC_FTYP)) {
                    throw new IllegalArgumentException("Nội dung file không phải MP4");
                }
                break;
            default:
                break;
        }
    }

    private static boolean startsWith(byte[] data, byte[] prefix) {
        if (data == null || prefix == null || data.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) return false;
        }
        return true;
    }

    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<ReviewResponseDto> replyToReview(@RequestHeader(value = "X-User-Id", required = false) Long xUserId,
                                                           @RequestHeader(value = "userId", required = false) Long userIdHeader,
                                                           @PathVariable Long reviewId,
                                                           @RequestBody Map<String, String> body) {
        Long userId = xUserId != null ? xUserId : userIdHeader;
        if (userId == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        return ResponseEntity.ok(reviewService.replyToReview(userId, reviewId, body.get("content")));
    }
}