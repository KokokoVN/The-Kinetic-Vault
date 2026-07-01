package com.rainbowforest.productcatalogservice.dto;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * Request tạo/cập nhật sản phẩm từ admin UI.
 * Giữ tương thích các field Stitch đang gửi, đồng thời hỗ trợ brandId và categoryIds mới.
 */
public class ProductUpsertRequest {

    @NotBlank
    private String productName;

    private String discription;

    /** Danh mục chính theo id — tương thích ngược. */
    private Long categoryId;

    /** Danh sách các danh mục (ManyToMany) — ưu tiên hơn categoryId nếu có. */
    private List<Long> categoryIds;

    /** Thương hiệu sản phẩm (tùy chọn). */
    private Long brandId;

    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    private BigDecimal price;

    /** Có thể null khi PATCH; backend sẽ giữ nguyên availability nếu null. */
    private Integer availability;

    /** Cho phép set SKU khi cần; nếu null sẽ auto-generate khi tạo mới. */
    private String sku;

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getDiscription() {
        return discription;
    }

    public void setDiscription(String discription) {
        this.discription = discription;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public List<Long> getCategoryIds() {
        return categoryIds;
    }

    public void setCategoryIds(List<Long> categoryIds) {
        this.categoryIds = categoryIds;
    }

    public Long getBrandId() {
        return brandId;
    }

    public void setBrandId(Long brandId) {
        this.brandId = brandId;
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

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }
}
