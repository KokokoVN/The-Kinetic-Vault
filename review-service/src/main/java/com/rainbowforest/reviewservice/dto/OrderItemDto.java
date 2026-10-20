package com.rainbowforest.reviewservice.dto;

import lombok.Data;

@Data
public class OrderItemDto {
    private Long id;
    private Long productId;
    private Long variantId;
    private String variantName;
    private String variantAttributesJson;
    private Integer quantity;
}
