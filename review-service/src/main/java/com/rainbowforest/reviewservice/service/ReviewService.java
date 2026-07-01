package com.rainbowforest.reviewservice.service;

import com.rainbowforest.reviewservice.dto.ReviewRequest;
import com.rainbowforest.reviewservice.dto.ReviewResponseDto;
import java.util.List;

public interface ReviewService {
    ReviewResponseDto createReview(Long userId, ReviewRequest request);
    ReviewResponseDto editReview(Long userId, Long reviewId, ReviewRequest request);
    List<ReviewResponseDto> getReviewsByProduct(Long productId);
    List<ReviewResponseDto> getReviewsByUser(Long userId);
    ReviewResponseDto replyToReview(Long userId, Long reviewId, String content);
}
