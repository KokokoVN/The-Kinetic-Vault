package com.rainbowforest.inventoryservice.entity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
public class StockMovement extends AuditableEntity {

    public static final String INBOUND = "INBOUND";
    public static final String OUTBOUND = "OUTBOUND";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "movement_type", length = 16)
    private String movementType;

    @NotNull
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "variant_id")
    private Long variantId;

    @NotNull
    @Column(name = "quantity")
    private int quantity;

    @Column(name = "reference_type", length = 64)
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "unit_cost", precision = 19, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "movement_at")
    private LocalDateTime movementAt;

    @Column(name = "balance_after")
    private Integer balanceAfter;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMovementType() {
        return movementType;
    }

    public void setMovementType(String movementType) {
        this.movementType = movementType;
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

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
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

    public Integer getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(Integer balanceAfter) {
        this.balanceAfter = balanceAfter;
    }
}

