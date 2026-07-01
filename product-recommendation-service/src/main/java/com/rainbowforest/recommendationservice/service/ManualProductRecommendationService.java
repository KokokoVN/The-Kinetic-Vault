package com.rainbowforest.recommendationservice.service;

import com.rainbowforest.recommendationservice.model.ManualProductRecommendation;

import java.util.List;

public interface ManualProductRecommendationService {

    List<ManualProductRecommendation> listForSourceProduct(Long sourceProductId);

    ManualProductRecommendation create(Long sourceProductId, Long targetProductId, Integer sortOrder, String reason, String performedBy);

    void delete(Long sourceProductId, Long id, String performedBy);
}

