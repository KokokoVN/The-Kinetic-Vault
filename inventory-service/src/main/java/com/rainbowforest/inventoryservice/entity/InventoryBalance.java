package com.rainbowforest.inventoryservice.entity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "inventory_balances", uniqueConstraints = {
        @UniqueConstraint(name = "uk_product_variant_balance", columnNames = {"product_id", "variant_id"})
})
public class InventoryBalance extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "variant_id")
    private Long variantId;

    @NotNull
    @Column(name = "quantity_on_hand")
    private int quantityOnHand;

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

    public Long getVariantId() {
        return variantId;
    }

    public void setVariantId(Long variantId) {
        this.variantId = variantId;
    }

    public int getQuantityOnHand() {
        return quantityOnHand;
    }

    public void setQuantityOnHand(int quantityOnHand) {
        this.quantityOnHand = quantityOnHand;
    }
}

