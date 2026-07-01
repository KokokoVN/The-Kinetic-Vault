package com.rainbowforest.productcatalogservice.dto;

/**
 * Thông tin trước khi xóa danh mục (số SP liên quan, danh mục con).
 */
public class CategoryDeletePreview {

    private long categoryId;
    private String name;
    private String slug;
    private long productCount;
    private long childCategoryCount;

    public CategoryDeletePreview() {
    }

    public CategoryDeletePreview(long categoryId, String name, String slug,
                                 long productCount, long childCategoryCount) {
        this.categoryId = categoryId;
        this.name = name;
        this.slug = slug;
        this.productCount = productCount;
        this.childCategoryCount = childCategoryCount;
    }

    public long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(long categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public long getProductCount() {
        return productCount;
    }

    public void setProductCount(long productCount) {
        this.productCount = productCount;
    }

    public long getChildCategoryCount() {
        return childCategoryCount;
    }

    public void setChildCategoryCount(long childCategoryCount) {
        this.childCategoryCount = childCategoryCount;
    }

    /** Có sản phẩm liên quan — cần xác nhận trước khi gọi xóa với {@code confirm=true}. */
    public boolean isRequiresProductDeleteConfirm() {
        return productCount > 0;
    }
}
