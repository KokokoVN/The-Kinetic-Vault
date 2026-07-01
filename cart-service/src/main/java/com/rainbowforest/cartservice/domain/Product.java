package com.rainbowforest.cartservice.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Product {

    private Long id;
    private String sku;
    private String productName;
    private BigDecimal price;
    private BigDecimal effectivePrice;
    private String primaryImageUrl;
    private String category;
    private Long categoryId;
    private Integer availability;
    private Boolean hidden;
    private LocalDateTime deletedAt;

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

    public String getPrimaryImageUrl() {
        return primaryImageUrl;
    }

    public void setPrimaryImageUrl(String primaryImageUrl) {
        this.primaryImageUrl = primaryImageUrl;
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

    public Integer getAvailability() {
        return availability;
    }

    public void setAvailability(Integer availability) {
        this.availability = availability;
    }

    public Boolean getHidden() {
        return hidden;
    }

    public void setHidden(Boolean hidden) {
        this.hidden = hidden;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}
