package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Table(name = "products")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sku", unique = true, length = 64)
    private String sku;

    @Column(name = "product_name")
    @NotNull
    private String productName;

    @Column(name = "price")
    @NotNull
    private BigDecimal price;

    @Column(name = "discription")
    private String discription;

    /** Liên kết thương hiệu (Brand). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    @JsonIgnore
    private Brand brand;

    /** Danh mục: ManyToMany (một SP có thể thuộc nhiều danh mục). */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "product_categories",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @JsonIgnore
    private List<Category> categories = new ArrayList<>();

    /** Giữ lại trường cũ để tương thích ngược (admin controller dùng setCategoryEntity). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnore
    private Category categoryEntity;

    @Column(name = "availability")
    @NotNull
    /** Dùng Integer để PUT JSON có thể bỏ qua field (null) — tránh ghi đè tồn kho = 0 nhầm. */
    private Integer availability;

    @Column(name = "is_hidden", nullable = false)
    private Boolean hidden = Boolean.FALSE;

    /** Lượt xem sản phẩm — tự động tăng khi user xem chi tiết. */
    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    /** Lượt bán sản phẩm — tự động tăng khi đơn hàng hoàn thành. */
    @Column(name = "sales_count", nullable = false)
    private Long salesCount = 0L;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<ProductImage> images = new ArrayList<>();

    /** Giá hiệu lực (hiện tại bằng price; không lưu DB). */
    @Transient
    private BigDecimal effectivePrice;

    /** Khoảng giá theo phân loại (không lưu DB). */
    @Transient
    private BigDecimal minVariantPrice;

    @Transient
    private BigDecimal maxVariantPrice;

    @PrePersist
    public void ensureSku() {
        if (sku == null || sku.isEmpty()) {
            sku = "SKU-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        }
        if (availability == null) {
            availability = 0;
        }
        if (viewCount == null) {
            viewCount = 0L;
        }
        if (salesCount == null) {
            salesCount = 0L;
        }
    }

    public Product() {
    }

    public void applyEffectivePrice() {
        this.effectivePrice = this.price;
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

    // === Brand ===

    @JsonIgnore
    public Brand getBrand() {
        return brand;
    }

    public void setBrand(Brand brand) {
        this.brand = brand;
    }

    @JsonProperty("brandId")
    public Long getBrandId() {
        return brand != null ? brand.getId() : null;
    }

    @JsonProperty("brandName")
    public String getBrandName() {
        return brand != null ? brand.getName() : null;
    }

    // === Categories (ManyToMany) ===

    @JsonIgnore
    public List<Category> getCategories() {
        return categories;
    }

    public void setCategories(List<Category> categories) {
        this.categories = categories;
    }

    @JsonProperty("categoryIds")
    public List<Long> getCategoryIds() {
        if (categories == null || categories.isEmpty()) {
            // fallback: nếu dùng cột category_id cũ
            if (categoryEntity != null && categoryEntity.getId() != null) {
                return List.of(categoryEntity.getId());
            }
            return List.of();
        }
        return categories.stream()
                .map(Category::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @JsonProperty("categoryNames")
    public List<String> getCategoryNames() {
        if (categories == null || categories.isEmpty()) {
            if (categoryEntity != null && categoryEntity.getName() != null) {
                return List.of(categoryEntity.getName());
            }
            return List.of();
        }
        return categories.stream()
                .map(Category::getName)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // === Legacy single category (backward compatible) ===

    @JsonIgnore
    public Category getCategoryEntity() {
        return categoryEntity;
    }

    public void setCategoryEntity(Category categoryEntity) {
        this.categoryEntity = categoryEntity;
    }

    @JsonProperty("categoryId")
    public Long getCategoryId() {
        if (categoryEntity != null) return categoryEntity.getId();
        if (categories != null && !categories.isEmpty()) return categories.get(0).getId();
        return null;
    }

    @JsonProperty("category")
    public String getCategoryName() {
        if (categoryEntity != null) return categoryEntity.getName();
        if (categories != null && !categories.isEmpty()) return categories.get(0).getName();
        return null;
    }

    // === Availability / Hidden ===

    public Integer getAvailability() {
        return availability;
    }

    public void setAvailability(Integer availability) {
        this.availability = availability;
    }

    public Boolean getHidden() {
        return hidden;
    }

    public void setHidden(Boolean hidden) {
        this.hidden = hidden;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    // === View & Sales count ===

    public Long getViewCount() {
        return viewCount;
    }

    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }

    public Long getSalesCount() {
        return salesCount;
    }

    public void setSalesCount(Long salesCount) {
        this.salesCount = salesCount;
    }

    // === Images ===

    /** Bo khoi JSON mac dinh — tranh lazy khi GET /products (co the mo bang API rieng neu can). */
    @JsonIgnore
    public List<ProductImage> getImages() {
        return images;
    }

    public void setImages(List<ProductImage> images) {
        this.images = images;
    }

    @JsonProperty("primaryImageUrl")
    public String getPrimaryImageUrl() {
        if (images == null || images.isEmpty()) {
            return null;
        }
        for (ProductImage img : images) {
            if (img != null && img.isPrimaryImage()) {
                if (img.getImageUrl() != null && !img.getImageUrl().trim().isEmpty()) {
                    return img.getImageUrl().trim();
                }
                if (img.getStoragePath() != null && !img.getStoragePath().trim().isEmpty()) {
                    return img.getStoragePath().trim();
                }
            }
        }
        ProductImage first = images.stream().filter(Objects::nonNull).findFirst().orElse(null);
        if (first == null) {
            return null;
        }
        if (first.getImageUrl() != null && !first.getImageUrl().trim().isEmpty()) {
            return first.getImageUrl().trim();
        }
        if (first.getStoragePath() != null && !first.getStoragePath().trim().isEmpty()) {
            return first.getStoragePath().trim();
        }
        return null;
    }

    // === Pricing ===

    @JsonProperty("effectivePrice")
    public BigDecimal getEffectivePrice() {
        return effectivePrice != null ? effectivePrice : price;
    }

    public void setEffectivePrice(BigDecimal effectivePrice) {
        this.effectivePrice = effectivePrice;
    }

    @JsonProperty("minVariantPrice")
    public BigDecimal getMinVariantPrice() {
        return minVariantPrice;
    }

    public void setMinVariantPrice(BigDecimal minVariantPrice) {
        this.minVariantPrice = minVariantPrice;
    }

    @JsonProperty("maxVariantPrice")
    public BigDecimal getMaxVariantPrice() {
        return maxVariantPrice;
    }

    public void setMaxVariantPrice(BigDecimal maxVariantPrice) {
        this.maxVariantPrice = maxVariantPrice;
    }
}
