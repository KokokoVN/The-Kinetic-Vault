package com.rainbowforest.productcatalogservice.exception;

/**
 * Danh mục còn sản phẩm liên quan — cần gọi lại xóa với {@code confirm=true} sau khi người dùng xác nhận.
 */
public class CategoryDeletionRequiresConfirmationException extends RuntimeException {

    private final long productCount;

    public CategoryDeletionRequiresConfirmationException(long productCount) {
        super("REQUIRES_CONFIRMATION");
        this.productCount = productCount;
    }

    public long getProductCount() {
        return productCount;
    }
}
