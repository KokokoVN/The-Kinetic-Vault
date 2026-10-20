package com.rainbowforest.reviewservice.service;

import com.rainbowforest.reviewservice.dto.OrderDto;
import com.rainbowforest.reviewservice.dto.OrderItemDto;
import com.rainbowforest.reviewservice.dto.ReviewReplyDto;
import com.rainbowforest.reviewservice.dto.ReviewRequest;
import com.rainbowforest.reviewservice.dto.ReviewResponseDto;
import com.rainbowforest.reviewservice.entity.Review;
import com.rainbowforest.reviewservice.entity.ReviewEditHistory;
import com.rainbowforest.reviewservice.entity.ReviewMedia;
import com.rainbowforest.reviewservice.entity.ReviewResponse;
import com.rainbowforest.reviewservice.feign.OrderClient;
import com.rainbowforest.reviewservice.repository.ReviewEditHistoryRepository;
import com.rainbowforest.reviewservice.repository.ReviewMediaRepository;
import com.rainbowforest.reviewservice.repository.ReviewRepository;
import com.rainbowforest.reviewservice.repository.ReviewResponseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMediaRepository reviewMediaRepository;
    private final ReviewResponseRepository reviewResponseRepository;
    private final ReviewEditHistoryRepository reviewEditHistoryRepository;
    private final OrderClient orderClient;

    @Override
    @Transactional
    public ReviewResponseDto createReview(Long userId, ReviewRequest request) {
        // Validate Order
        OrderDto order = orderClient.getOrderById(request.getOrderId());
        if (order == null || !order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Order not found or does not belong to user");
        }
        if (!"DELIVERED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new IllegalArgumentException("Order is not delivered yet");
        }

        // Validate Variant in Order safely
        boolean variantFound = false;
        String resolvedVariantLabel = null;
        if (order.getOrderItems() != null) {
            for (OrderItemDto item : order.getOrderItems()) {
                if (item.getProductId() != null && item.getProductId().equals(request.getProductId())) {
                    Long itemVarId = item.getVariantId();
                    Long reqVarId = request.getVariantId();
                    boolean varMatches = (itemVarId == null || itemVarId == 0L)
                            ? (reqVarId == null || reqVarId == 0L)
                            : itemVarId.equals(reqVarId);
                    if (varMatches) {
                        variantFound = true;
                        resolvedVariantLabel = item.getVariantName();
                        break;
                    }
                }
            }
        }
        if (!variantFound) {
            throw new IllegalArgumentException("Product variant not found in order");
        }

        // Check if already reviewed for this order + product + variant (Upsert logic)
        List<Review> existingReviews = reviewRepository.findByOrderIdAndProductId(request.getOrderId(), request.getProductId());
        Review existing = null;
        for (Review r : existingReviews) {
            Long rVar = r.getVariantId();
            Long reqVar = request.getVariantId();
            boolean match = (rVar == null || rVar == 0L)
                    ? (reqVar == null || reqVar == 0L)
                    : rVar.equals(reqVar);
            if (match) {
                existing = r;
                break;
            }
        }
        if (existing != null) {
            return editReview(userId, existing.getId(), request);
        }

        Review review = new Review();
        review.setUserId(userId);
        review.setUserName(order.getUserName());
        review.setOrderId(request.getOrderId());
        review.setProductId(request.getProductId());
        review.setVariantId(request.getVariantId());
        review.setVariantLabel(resolvedVariantLabel);
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setStatus("ACTIVE");
        review.setCreatedAt(new Date());
        review.setUpdatedAt(new Date());

        review = reviewRepository.save(review);

        if (request.getMediaUrls() != null) {
            for (String url : request.getMediaUrls()) {
                ReviewMedia media = new ReviewMedia();
                media.setReview(review);
                media.setMediaType(url.matches("(?i).*\\.(mp4|mov|avi|webm)$") ? "VIDEO" : "IMAGE");
                media.setMediaUrl(url);
                media.setCreatedAt(new Date());
                reviewMediaRepository.save(media);
            }
        }

        return mapToDto(review);
    }

    @Override
    @Transactional
    public ReviewResponseDto editReview(Long userId, Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findByIdAndUserId(reviewId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found or not owned by user"));

        // Save history
        ReviewEditHistory history = new ReviewEditHistory();
        history.setReview(review);
        history.setOldRating(review.getRating());
        history.setOldContent(review.getContent());
        history.setEditedAt(new Date());
        reviewEditHistoryRepository.save(history);

        // Update review
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setUpdatedAt(new Date());

        review = reviewRepository.save(review);

        return mapToDto(review);
    }

    @Override
    public List<ReviewResponseDto> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductId(productId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponseDto> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewResponseDto replyToReview(Long userId, Long reviewId, String content) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        ReviewResponse response = new ReviewResponse();
        response.setReview(review);
        response.setRespondedBy(String.valueOf(userId));
        response.setContent(content);
        response.setCreatedAt(new Date());

        reviewResponseRepository.save(response);

        // Refresh review to get responses
        review = reviewRepository.findById(reviewId).get();
        return mapToDto(review);
    }

    private ReviewResponseDto mapToDto(Review review) {
        ReviewResponseDto dto = new ReviewResponseDto();
        dto.setId(review.getId());
        dto.setUserId(review.getUserId());
        dto.setUserName(review.getUserName());
        dto.setOrderId(review.getOrderId());
        dto.setProductId(review.getProductId());
        dto.setVariantId(review.getVariantId());
        dto.setVariantLabel(review.getVariantLabel());
        dto.setRating(review.getRating());
        dto.setContent(review.getContent());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());

        if (review.getMediaList() != null) {
            dto.setMediaUrls(review.getMediaList().stream()
                    .map(ReviewMedia::getMediaUrl)
                    .collect(Collectors.toList()));
        }

        if (review.getResponses() != null && !review.getResponses().isEmpty()) {
            dto.setReplies(review.getResponses().stream().map(r -> {
                ReviewReplyDto replyDto = new ReviewReplyDto();
                replyDto.setId(r.getId());
                try {
                    replyDto.setUserId(Long.parseLong(r.getRespondedBy()));
                } catch (Exception ignored) {}
                replyDto.setContent(r.getContent());
                replyDto.setCreatedAt(r.getCreatedAt());
                return replyDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
