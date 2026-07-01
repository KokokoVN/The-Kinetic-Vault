package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.math.BigDecimal;

@Entity
@Table(name = "product_variants",
        indexes = {
            @Index(name = "idx_pv_product", columnList = "product_id"),
            @Index(name = "idx_pv_size_color", columnList = "size,color")
        },
        uniqueConstraints = {
            @UniqueConstraint(name = "uq_pv_product_size_color", columnNames = {"product_id", "size", "color"})
        }
)
public class ProductVariant extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;

    @NotBlank
    @Size(max = 64)
    @Column(name = "size", length = 64, nullable = false)
    private String size;

    @NotBlank
    @Size(max = 64)
    @Column(name = "color", length = 64, nullable = false)
    private String color;

    @Size(max = 1024)
    @Column(name = "variant_image_url", length = 1024)
    private String variantImageUrl;

    @Column(name = "price")
    private BigDecimal price;

    /** Tồn kho theo biến thể (mặc định 0). */
    @Column(name = "availability")
    private Integer availability = 0;

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

