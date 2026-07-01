package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    Optional<Brand> findByNameIgnoreCase(String name);
}
