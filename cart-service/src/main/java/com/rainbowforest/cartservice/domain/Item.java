package com.rainbowforest.cartservice.domain;

import java.math.BigDecimal;

public class Item {
    private int quantity;
    private BigDecimal subTotal;
    private Long productId;
    private Long variantId;
    private String variantLabel;
    /** Optional per-variant image (catalog variantImageUrl), for cart display. */
    private String variantImageUrl;
    private BigDecimal originalPrice;
    private Product product;

    public Item() {
    }

    public Item(int quantity, Long productId, Product product, BigDecimal subTotal) {
        this.quantity = quantity;
        this.productId = productId;
        this.product = product;
        this.subTotal = subTotal;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(BigDecimal subTotal) {
        this.subTotal = subTotal;
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

    public String getVariantLabel() {
        return variantLabel;
    }

    public void setVariantLabel(String variantLabel) {
        this.variantLabel = variantLabel;
    }

    public String getVariantImageUrl() {
        return variantImageUrl;
    }

    public void setVariantImageUrl(String variantImageUrl) {
        this.variantImageUrl = variantImageUrl;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }
}
