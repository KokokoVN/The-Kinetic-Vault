package com.rainbowforest.recommendationservice.dto;

import java.math.BigDecimal;

public class SimilarRecommendationResponse {
    private Long productId;
    private String productName;
    private String sku;
    private Long categoryId;
    private BigDecimal price;
    private BigDecimal priceDelta;
    private String reason;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getPriceDelta() {
        return priceDelta;
    }

    public void setPriceDelta(BigDecimal priceDelta) {
        this.priceDelta = priceDelta;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
