package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsBySku(String sku);

    Optional<Product> findBySku(String sku);

    boolean existsByProductNameIgnoreCase(String productName);

    boolean existsByProductNameIgnoreCaseAndIdNot(String productName, Long id);

    /** Fetch categoryEntity (tránh lazy trong một số API admin). */
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categoryEntity LEFT JOIN FETCH p.images "
            + "WHERE p.deletedAt IS NULL AND (p.hidden IS NULL OR p.hidden = false)")
    List<Product> findAllFetched();

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categoryEntity LEFT JOIN FETCH p.images "
            + "WHERE p.deletedAt IS NULL AND (p.hidden IS NULL OR p.hidden = false) AND p.availability > 0")
    List<Product> findAllAvailableForUser();

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categoryEntity LEFT JOIN FETCH p.images "
            + "WHERE p.deletedAt IS NULL AND (p.hidden IS NULL OR p.hidden = false) "
            + "AND p.availability > 0 AND p.categoryEntity IS NOT NULL AND p.categoryEntity.id = :categoryId")
    List<Product> findAllAvailableForUserByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categoryEntity LEFT JOIN FETCH p.images "
            + "WHERE p.deletedAt IS NULL AND (p.hidden IS NULL OR p.hidden = false) AND p.availability > 0 "
            + "ORDER BY p.createdAt DESC")
    List<Product> findAllAvailableForUserOrderByNewest();

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categoryEntity LEFT JOIN FETCH p.images "
            + "WHERE p.deletedAt IS NULL AND (p.hidden IS NULL OR p.hidden = false) AND p.availability > 0 "
            + "ORDER BY p.salesCount DESC")
    List<Product> findAllAvailableForUserOrderBySalesCount();

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categoryEntity LEFT JOIN FETCH p.images "
            + "WHERE p.deletedAt IS NULL AND (p.hidden IS NULL OR p.hidden = false) AND p.availability > 0 AND p.id IN :ids")
    List<Product> findAllAvailableForUserByIds(@Param("ids") List<Long> ids);

    /** Admin: vẫn loại bỏ bản ghi đã xóa mềm, nhưng bao gồm cả hidden. */
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categoryEntity LEFT JOIN FETCH p.images "
            + "WHERE p.deletedAt IS NULL")
    List<Product> findAllFetchedForAdmin();

    /** Admin: bao gồm cả hidden và cả đã xóa mềm (để khôi phục). */
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categoryEntity LEFT JOIN FETCH p.images")
    List<Product> findAllFetchedForAdminIncludeDeleted();

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categoryEntity LEFT JOIN FETCH p.images "
            + "WHERE p.deletedAt IS NULL AND (p.hidden IS NULL OR p.hidden = false) "
            + "AND (p.categoryEntity IS NOT NULL AND p.categoryEntity.name = :name)")
    List<Product> findAllByCategory(@Param("name") String name);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categoryEntity LEFT JOIN FETCH p.images "
            + "WHERE p.deletedAt IS NULL AND (p.hidden IS NULL OR p.hidden = false) AND p.productName = :name")
    List<Product> findAllByProductName(@Param("name") String name);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categoryEntity LEFT JOIN FETCH p.images "
            + "WHERE p.id = :id AND p.deletedAt IS NULL AND (p.hidden IS NULL OR p.hidden = false)")
    Optional<Product> findByIdFetched(@Param("id") Long id);

    /** Admin: một sản phẩm theo id (kể cả ẩn / đã xóa mềm) — dùng cho GET chi tiết quản trị. */
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categoryEntity LEFT JOIN FETCH p.images WHERE p.id = :id")
    Optional<Product> findByIdAdminFetched(@Param("id") Long id);

    /**
     * Sản phẩm gắn {@code category_id} trùng danh mục.
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.categoryEntity IS NOT NULL AND p.categoryEntity.id = :id")
    long countLinkedToCategory(@Param("id") Long id);

    /**
     * Danh sách sản phẩm gắn {@code category_id} (cùng logic {@link #countLinkedToCategory}).
     */
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categoryEntity LEFT JOIN FETCH p.images WHERE "
            + "p.categoryEntity IS NOT NULL AND p.categoryEntity.id = :id")
    List<Product> findAllLinkedToCategory(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Product p SET p.hidden = :hidden WHERE p.categoryEntity IS NOT NULL AND p.categoryEntity.id = :id")
    int updateHiddenByCategory(@Param("id") Long id, @Param("hidden") Boolean hidden);

}
