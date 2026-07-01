package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.ProductChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductChangeLogRepository extends JpaRepository<ProductChangeLog, Long> {

    /** Lấy tất cả change log của một sản phẩm, mới nhất trước. */
    List<ProductChangeLog> findByProductIdOrderByChangedAtDesc(Long productId);
}
