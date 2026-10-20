package com.rainbowforest.orderservice.dto;

public class ReviewOrderItemDto {

    private Long id;
    private Long productId;
    private Long variantId;
    private String variantName;
    private String variantAttributesJson;
    private Integer quantity;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Long getVariantId() {
        return variantId;
    }

    public void setVariantId(Long variantId) {
        this.variantId = variantId;
    }

    public String getVariantName() {
        return variantName;
    }

    public void setVariantName(String variantName) {
        this.variantName = variantName;
    }

    public String getVariantAttributesJson() {
        return variantAttributesJson;
    }

    public void setVariantAttributesJson(String variantAttributesJson) {
        this.variantAttributesJson = variantAttributesJson;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
