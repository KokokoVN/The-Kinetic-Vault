package com.rainbowforest.productcatalogservice.dto;

import java.math.BigDecimal;

public class ProductVariantPublicDto {
    private Long id;
    private Long productId;
    private String size;
    private String color;
    private String variantImageUrl;
    private BigDecimal price;
    private Integer availability;

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

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
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

    public Integer getAvailability() {
        return availability;
    }

    public void setAvailability(Integer availability) {
        this.availability = availability;
    }
}

