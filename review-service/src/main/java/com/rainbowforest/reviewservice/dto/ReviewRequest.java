package com.rainbowforest.reviewservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class ReviewRequest {
    private Long orderId;
    private Long productId;
    private Long variantId;
    private Integer rating;
    private String content;
    private List<String> mediaUrls;
}
