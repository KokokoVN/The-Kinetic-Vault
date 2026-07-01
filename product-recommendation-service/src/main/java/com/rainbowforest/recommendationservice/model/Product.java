package com.rainbowforest.recommendationservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import javax.persistence.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "products")
public class Product extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sku", length = 64)
    private String sku;

    @Column(name = "product_name")
    private String productName;

    /** Các field dưới đây dùng để deserialize response mới từ product-catalog-service. */
    @Transient
    private BigDecimal price;

    @Transient
    private String discription;

    @Transient
    private String category;

    @Transient
    private Long categoryId;

    @Transient
    private Integer availability;

    @Transient
    private String primaryImageUrl;

    @Transient
    private BigDecimal effectivePrice;

    @OneToMany(mappedBy = "product")
    @JsonIgnore
    private List<Recommendation> recomendations;

    public Product() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getDiscription() {
        return discription;
    }

    public void setDiscription(String discription) {
        this.discription = discription;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @JsonProperty("categoryId")
    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Integer getAvailability() {
        return availability;
    }

    public void setAvailability(Integer availability) {
        this.availability = availability;
    }

    public String getPrimaryImageUrl() {
        return primaryImageUrl;
    }

    public void setPrimaryImageUrl(String primaryImageUrl) {
        this.primaryImageUrl = primaryImageUrl;
    }

    public BigDecimal getEffectivePrice() {
        return effectivePrice;
    }

    public void setEffectivePrice(BigDecimal effectivePrice) {
        this.effectivePrice = effectivePrice;
    }

    public List<Recommendation> getRecomendations() {
        return recomendations;
    }

    public void setRecomendations(List<Recommendation> recomendations) {
        this.recomendations = recomendations;
    }
}
