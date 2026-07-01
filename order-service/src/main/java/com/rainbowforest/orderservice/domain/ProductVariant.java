package com.rainbowforest.orderservice.domain;

import java.math.BigDecimal;

public class ProductVariant {
    private Long id;
    private Long productId;
    /** Optional per-variant image from catalog (JSON: variantImageUrl). */
    private String variantImageUrl;
    private BigDecimal price;

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

    public String getVariantImageUrl() {
        return variantImageUrl;
    }

    public void setVariantImageUrl(String variantImageUrl) {
        this.variantImageUrl = variantImageUrl;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}

