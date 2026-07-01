package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProduct_IdOrderByIdAsc(Long productId);

    boolean existsByProduct_IdAndSizeIgnoreCaseAndColorIgnoreCase(Long productId, String size, String color);

    boolean existsByProduct_IdAndSizeIgnoreCaseAndColorIgnoreCaseAndIdNot(Long productId, String size, String color, Long id);

    java.util.Optional<ProductVariant> findByProduct_IdAndSizeIgnoreCaseAndColorIgnoreCase(Long productId, String size, String color);

    @Query("SELECT MIN(v.price), MAX(v.price) FROM ProductVariant v WHERE v.product.id = :productId AND v.price IS NOT NULL")
    Object[] findVariantPriceRangeByProductId(@Param("productId") Long productId);
}

