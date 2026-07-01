package com.rainbowforest.recommendationservice.service;

import com.rainbowforest.recommendationservice.dto.SimilarRecommendationResponse;
import com.rainbowforest.recommendationservice.model.Recommendation;
import java.util.List;

public interface RecommendationService {
	Recommendation getRecommendationById(Long recommendationId);
    Recommendation saveRecommendation(Recommendation recommendation);
    List<Recommendation> getAllRecommendationByProductName(String productName);
    List<SimilarRecommendationResponse> listSimilarRecommendations(Long productId, int limit);
    void deleteRecommendation(Long id);
}
