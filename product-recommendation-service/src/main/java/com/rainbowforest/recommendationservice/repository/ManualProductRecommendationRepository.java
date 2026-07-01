package com.rainbowforest.recommendationservice.repository;

import com.rainbowforest.recommendationservice.model.ManualProductRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ManualProductRecommendationRepository extends JpaRepository<ManualProductRecommendation, Long> {

    List<ManualProductRecommendation> findBySourceProductIdOrderBySortOrderAscIdAsc(Long sourceProductId);

    boolean existsBySourceProductIdAndTargetProductId(Long sourceProductId, Long targetProductId);

    Optional<ManualProductRecommendation> findByIdAndSourceProductId(Long id, Long sourceProductId);
}

