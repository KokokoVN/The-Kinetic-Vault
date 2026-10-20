package com.rainbowforest.reviewservice.dto;

import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class ReviewResponseDto {
    private Long id;
    private Long userId;
    private String userName;
    private Long orderId;
    private Long productId;
    private Long variantId;
    private String variantLabel;
    private Integer rating;
    private String content;
    private Date createdAt;
    private Date updatedAt;
    private List<String> mediaUrls;
    private List<ReviewReplyDto> replies;
}
