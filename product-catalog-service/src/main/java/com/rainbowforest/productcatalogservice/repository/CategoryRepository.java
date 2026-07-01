package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByDeletedAtIsNull();

    @Query("SELECT c FROM Category c WHERE c.deletedAt IS NULL AND (c.hidden IS NULL OR c.hidden = false)")
    List<Category> findAllPublicCategories();

    List<Category> findAllByDeletedAtIsNotNull();

    Optional<Category> findByIdAndDeletedAtIsNull(Long id);

    Optional<Category> findBySlugAndDeletedAtIsNull(String slug);

    boolean existsBySlugAndDeletedAtIsNull(String slug);

    boolean existsByNameIgnoreCaseAndDeletedAtIsNull(String name);

    boolean existsByNameIgnoreCaseAndIdNotAndDeletedAtIsNull(String name, Long id);

    boolean existsBySlugAndIdNotAndDeletedAtIsNull(String slug, Long id);

    long countByParentIdAndDeletedAtIsNull(Long parentId);
}
