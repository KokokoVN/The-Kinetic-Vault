package com.rainbowforest.orderservice.dto;

public class SaleProgramItem {
    private Long productId;
    private Long variantId;

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
}
