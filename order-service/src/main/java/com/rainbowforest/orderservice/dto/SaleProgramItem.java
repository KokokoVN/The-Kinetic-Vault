package com.rainbowforest.orderservice.dto;

public class SaleProgramItem {
    private Long productId;
    private Long variantId;
    private Integer promoQtyLimit;

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
    public Integer getPromoQtyLimit() {
        return promoQtyLimit;
    }
    public void setPromoQtyLimit(Integer promoQtyLimit) {
        this.promoQtyLimit = promoQtyLimit;
    }
}
