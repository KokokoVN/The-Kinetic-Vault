package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Entity
@Table(name = "product_technical_specs", indexes = {
        @Index(name = "idx_pts_product", columnList = "product_id"),
        @Index(name = "idx_pts_key", columnList = "spec_key")
})
public class ProductTechnicalSpec extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;

    @NotBlank
    @Size(max = 120)
    @Column(name = "spec_key", length = 120, nullable = false)
    private String specKey;

    @NotBlank
    @Size(max = 1000)
    @Column(name = "spec_value", length = 1000, nullable = false)
    private String specValue;

    @Size(max = 64)
    @Column(name = "unit", length = 64)
    private String unit;

    @Column(name = "sort_order")
    private int sortOrder = 0;

    /**
     * Nhóm thông số kỹ thuật (ví dụ: "CPU", "Màn hình", "Pin", "Bộ nhớ").
     * Cho phép gom nhóm các thông số liên quan trên giao diện chi tiết sản phẩm.
     */
    @Column(name = "spec_group", length = 120)
    private String specGroup;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getSpecKey() {
        return specKey;
    }

    public void setSpecKey(String specKey) {
        this.specKey = specKey;
    }

    public String getSpecValue() {
        return specValue;
    }

    public void setSpecValue(String specValue) {
        this.specValue = specValue;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getSpecGroup() {
        return specGroup;
    }

    public void setSpecGroup(String specGroup) {
        this.specGroup = specGroup;
    }
}

