package com.rainbowforest.reviewservice.controller;

import com.rainbowforest.reviewservice.dto.ReviewRequest;
import com.rainbowforest.reviewservice.dto.ReviewResponseDto;
import com.rainbowforest.reviewservice.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private static final Path REVIEW_MEDIA_DIR = Paths.get("uploads", "review-media");

    @PostMapping
    public ResponseEntity<ReviewResponseDto> createReview(@RequestHeader("userId") Long userId,
                                                          @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.createReview(userId, request));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDto> editReview(@RequestHeader("userId") Long userId,
                                                        @PathVariable Long reviewId,
                                                        @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.editReview(userId, reviewId, request));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    @GetMapping("/user")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByUser(@RequestHeader("userId") Long userId) {
        return ResponseEntity.ok(reviewService.getReviewsByUser(userId));
    }

    @PostMapping(value = "/media/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadReviewMedia(@RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Không có file upload"));
        }
        try {
            Files.createDirectories(REVIEW_MEDIA_DIR);
            
            // Sử dụng parallel stream để upload nhiều ảnh/video cùng lúc (tăng tốc độ)
            java.util.List<String> urls = java.util.Arrays.stream(files)
                    .parallel()
                    .filter(file -> file != null && !file.isEmpty())
                    .map(file -> {
                        try {
                            String originalName = file.getOriginalFilename();
                            String ext = "";
                            if (originalName != null && originalName.lastIndexOf('.') > -1) {
                                ext = originalName.substring(originalName.lastIndexOf('.'));
                            }
                            String filename = UUID.randomUUID().toString() + ext;
                            Path output = REVIEW_MEDIA_DIR.resolve(filename);
                            file.transferTo(output);
                            return "/api/reviews/media/" + filename;
                        } catch (Exception e) {
                            throw new RuntimeException("Lỗi khi lưu file: " + e.getMessage(), e);
                        }
                    })
                    .collect(java.util.stream.Collectors.toList());
                    
            return ResponseEntity.ok(java.util.Map.of("uploaded", true, "urls", urls));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Upload thất bại", "error", ex.getMessage()));
        }
    }

    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<ReviewResponseDto> replyToReview(@RequestHeader("userId") Long userId,
                                                           @PathVariable Long reviewId,
                                                           @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(reviewService.replyToReview(userId, reviewId, body.get("content")));
    }
}
