package com.rainbowforest.productcatalogservice.exception;

/**
 * Danh mục còn danh mục con — không xóa được cho đến khi xử lý các danh mục con.
 */
public class CategoryHasChildCategoriesException extends RuntimeException {

    private final long childCategoryCount;

    public CategoryHasChildCategoriesException(long childCategoryCount) {
        super("HAS_CHILD_CATEGORIES");
        this.childCategoryCount = childCategoryCount;
    }

    public long getChildCategoryCount() {
        return childCategoryCount;
    }
}
