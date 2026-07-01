package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.dto.CategoryDeletePreview;
import com.rainbowforest.productcatalogservice.entity.Category;
import com.rainbowforest.productcatalogservice.entity.Product;

import java.util.List;

public interface CategoryService {

    /** Message của {@link IllegalArgumentException} khi trùng tên danh mục (không phân biệt hoa thường). */
    String DUPLICATE_NAME = "DUPLICATE_NAME";

    /** Trùng slug với danh mục đang hoạt động khác (vd. khi khôi phục). */
    String DUPLICATE_SLUG = "DUPLICATE_SLUG";

    /**
     * @param actorUsername người thực hiện (từ header X-Username qua gateway), có thể null
     * @param actorUserId   id người dùng (header X-User-Id), có thể null
     */
    Category save(Category category, String actorUsername, String actorUserId);

    /** Cập nhật tên/slug; trùng tên (khác id) → {@link #DUPLICATE_NAME}. */
    Category update(Long id, Category patch, String actorUsername, String actorUserId);

    /** Khôi phục danh mục đã xóa mềm (giữ nguyên id). */
    Category restore(Long id, String actorUsername, String actorUserId);

    /** Danh sách theo trạng thái xóa: active (mặc định), deleted, all. */
    List<Category> findAll(String deletedFilter);

    List<Category> findAll();

    Category findById(Long id);

    /** Kiểm tra trùng tên khi nhập form. */
    boolean existsByNameIgnoreCase(String name);

    /** Kiểm tra trùng tên khi chỉnh sửa, loại trừ chính bản ghi hiện tại. */
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    /** Xem trước khi xóa: số SP, số danh mục con. Trả về {@code null} nếu không tồn tại. */
    CategoryDeletePreview getDeletePreview(Long id);

    /** Sản phẩm liên quan (FK hoặc tên danh mục text cũ). Rỗng nếu danh mục không tồn tại hoặc đã xóa mềm. */
    List<Product> listProductsLinkedToCategory(Long categoryId);

    /**
     * Xóa danh mục. Nếu còn SP liên quan thì chỉ xóa được khi {@code confirmDeleteWithProducts} là {@code true}
     * (sau khi người dùng xác nhận); gỡ {@code category_id} khỏi các sản phẩm rồi đánh dấu xóa mềm ({@code deleted_at}).
     */
    void deleteById(Long id, boolean confirmDeleteWithProducts, String actorUsername, String actorUserId);
}
