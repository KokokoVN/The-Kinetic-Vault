package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.ProductTechnicalSpec;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductTechnicalSpecRepository extends JpaRepository<ProductTechnicalSpec, Long> {
    List<ProductTechnicalSpec> findByProduct_IdOrderBySortOrderAscIdAsc(Long productId);
}

