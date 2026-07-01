package com.rainbowforest.inventoryservice.dto;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StockOperationRequest {

    @NotNull
    private Long productId;
    private Long variantId;
    @NotNull
    @Min(1)
    private Integer quantity;
    private String referenceType;
    private Long referenceId;
    private String note;
    private BigDecimal unitCost;
    private LocalDateTime movementAt;
    private String performedBy;

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

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public LocalDateTime getMovementAt() {
        return movementAt;
    }

    public void setMovementAt(LocalDateTime movementAt) {
        this.movementAt = movementAt;
    }
}

