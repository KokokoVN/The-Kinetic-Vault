package com.rainbowforest.inventoryservice.dto;

import com.rainbowforest.inventoryservice.entity.StockMovement;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StockMovementResponse {
    private Long id;
    private String movementType;
    private Long productId;
    private Long variantId;
    private Integer quantity;
    private String referenceType;
    private Long referenceId;
    private String note;
    private BigDecimal unitCost;
    private LocalDateTime movementAt;
    private Integer balanceAfter;
    private String createdBy;
    private LocalDateTime createdAt;

    public static StockMovementResponse from(StockMovement movement) {
        StockMovementResponse row = new StockMovementResponse();
        row.id = movement.getId();
        row.movementType = movement.getMovementType();
        row.productId = movement.getProductId();
        row.variantId = movement.getVariantId();
        row.quantity = movement.getQuantity();
        row.referenceType = movement.getReferenceType();
        row.referenceId = movement.getReferenceId();
        row.note = movement.getNote();
        row.unitCost = movement.getUnitCost();
        row.movementAt = movement.getMovementAt();
        row.balanceAfter = movement.getBalanceAfter();
        row.createdBy = movement.getCreatedBy();
        row.createdAt = movement.getCreatedAt();
        return row;
    }

    public Long getId() {
        return id;
    }

    public String getMovementType() {
        return movementType;
    }

    public Long getProductId() {
        return productId;
    }

    public Long getVariantId() {
        return variantId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public String getNote() {
        return note;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public LocalDateTime getMovementAt() {
        return movementAt;
    }

    public Integer getBalanceAfter() {
        return balanceAfter;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}

