package com.rainbowforest.orderservice.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class Product {

    private Long id;
    private String sku;
    private String productName;
    private BigDecimal price;
    private BigDecimal effectivePrice;
    private String category;
    private Long categoryId;
    private String primaryImageUrl;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    @JsonProperty("effectivePrice")
    public BigDecimal getEffectivePrice() {
        return effectivePrice != null ? effectivePrice : price;
    }

    public void setEffectivePrice(BigDecimal effectivePrice) {
        this.effectivePrice = effectivePrice;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @JsonProperty("categoryId")
    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    @JsonProperty("primaryImageUrl")
    public String getPrimaryImageUrl() {
        return primaryImageUrl;
    }

    public void setPrimaryImageUrl(String primaryImageUrl) {
        this.primaryImageUrl = primaryImageUrl;
    }
}
