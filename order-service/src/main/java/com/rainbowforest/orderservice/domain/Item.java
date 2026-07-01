package com.rainbowforest.orderservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "items")
@EqualsAndHashCode(callSuper = false)
public class Item extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    private Long id;

    @Column(name = "quantity")
    @NotNull
    private int quantity;

    @Column(name = "subtotal")
    @NotNull
    private BigDecimal subTotal;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "variant_id")
    private Long variantId;

    @Column(name = "variant_label", length = 128)
    private String variantLabel;

    @Column(name = "product_name_snapshot", length = 255)
    private String productNameSnapshot;

    @Column(name = "product_sku_snapshot", length = 128)
    private String productSkuSnapshot;

    @Column(name = "product_image_snapshot", length = 500)
    private String productImageSnapshot;

    @Transient
    private Product product;

    @ManyToMany(mappedBy = "items")
    @JsonIgnore
    private List<Order> orders;

    public Item() {
    }

    public Item(@NotNull int quantity, Long productId, Product product, BigDecimal subTotal) {
        this.quantity = quantity;
        this.productId = productId;
        this.product = product;
        this.subTotal = subTotal;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getProductNameSnapshot() {
        return productNameSnapshot;
    }

    public void setProductNameSnapshot(String productNameSnapshot) {
        this.productNameSnapshot = productNameSnapshot;
    }

    public String getProductSkuSnapshot() {
        return productSkuSnapshot;
    }

    public void setProductSkuSnapshot(String productSkuSnapshot) {
        this.productSkuSnapshot = productSkuSnapshot;
    }

    public String getProductImageSnapshot() {
        return productImageSnapshot;
    }

    public void setProductImageSnapshot(String productImageSnapshot) {
        this.productImageSnapshot = productImageSnapshot;
    }

    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }
}
