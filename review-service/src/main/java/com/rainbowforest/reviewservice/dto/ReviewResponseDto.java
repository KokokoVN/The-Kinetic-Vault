package com.rainbowforest.reviewservice.dto;

import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class ReviewResponseDto {
    private Long id;
    private Long userId;
    private Long orderId;
    private Long productId;
    private Long variantId;
    private Integer rating;
    private String content;
    private Date createdAt;
    private Date updatedAt;
    private List<String> mediaUrls;
    private List<ReviewReplyDto> replies;
}

@Data
class ReviewReplyDto {
    private Long id;
    private Long userId; // Admin or user who replied
    private String content;
    private Date createdAt;
}
