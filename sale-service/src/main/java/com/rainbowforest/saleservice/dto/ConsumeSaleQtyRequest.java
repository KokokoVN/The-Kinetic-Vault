package com.rainbowforest.saleservice.dto;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Min;

public class ConsumeSaleQtyRequest {

    @NotNull(message = "productId cannot be null")
    private Long productId;

    private Long variantId;

    @NotNull(message = "quantity cannot be null")
    @Min(value = 1, message = "quantity must be at least 1")
    private Integer quantity;

    public ConsumeSaleQtyRequest() {
    }

    public ConsumeSaleQtyRequest(Long productId, Long variantId, Integer quantity) {
        this.productId = productId;
        this.variantId = variantId;
        this.quantity = quantity;
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
