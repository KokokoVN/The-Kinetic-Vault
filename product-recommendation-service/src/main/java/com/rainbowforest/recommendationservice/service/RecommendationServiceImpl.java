package com.rainbowforest.recommendationservice.service;

import com.rainbowforest.recommendationservice.dto.SimilarRecommendationResponse;
import com.rainbowforest.recommendationservice.feignClient.ProductClient;
import com.rainbowforest.recommendationservice.model.Product;
import com.rainbowforest.recommendationservice.model.Recommendation;
import com.rainbowforest.recommendationservice.repository.RecommendationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private ProductClient productClient;

    @Override
    public Recommendation saveRecommendation(Recommendation recommendation) {
        return recommendationRepository.save(recommendation);
    }

    @Override
    public List<Recommendation> getAllRecommendationByProductName(String productName) {
        return recommendationRepository.findAllRatingByProductName(productName);
    }

    @Override
    public List<SimilarRecommendationResponse> listSimilarRecommendations(Long productId, int limit) {
        if (productId == null) return java.util.Collections.emptyList();
        Product source = productClient.getProductById(productId);
        if (source == null) return java.util.Collections.emptyList();

        List<Product> all = productClient.getAllProducts();
        if (all == null || all.isEmpty()) return java.util.Collections.emptyList();

        BigDecimal basePrice = effectivePrice(source);
        Long baseCategoryId = source.getCategoryId();
        int safeLimit = Math.max(1, Math.min(limit, 24));

        List<Product> candidates = all.stream()
                .filter(Objects::nonNull)
                .filter(p -> p.getId() != null && !p.getId().equals(productId))
                .filter(p -> baseCategoryId == null || baseCategoryId.equals(p.getCategoryId()))
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            candidates = all.stream()
                    .filter(Objects::nonNull)
                    .filter(p -> p.getId() != null && !p.getId().equals(productId))
                    .collect(Collectors.toList());
        }

        List<ScoredProduct> scored = new ArrayList<>();
        BigDecimal min = basePrice != null ? basePrice.multiply(new BigDecimal("0.70")) : null;
        BigDecimal max = basePrice != null ? basePrice.multiply(new BigDecimal("1.30")) : null;

        for (Product p : candidates) {
            BigDecimal price = effectivePrice(p);
            if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) continue;
            if (min != null && max != null && (price.compareTo(min) < 0 || price.compareTo(max) > 0)) continue;

            BigDecimal gap = basePrice != null ? price.subtract(basePrice).abs() : BigDecimal.ZERO;
            scored.add(new ScoredProduct(p, gap));
        }

        if (scored.isEmpty()) {
            for (Product p : candidates) {
                BigDecimal price = effectivePrice(p);
                if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) continue;
                BigDecimal gap = basePrice != null ? price.subtract(basePrice).abs() : BigDecimal.ZERO;
                scored.add(new ScoredProduct(p, gap));
            }
        }

        scored.sort(Comparator
                .comparing((ScoredProduct s) -> s.priceGap)
                .thenComparing(s -> String.valueOf(s.product.getProductName())));

        return scored.stream().limit(safeLimit).map(s -> {
            SimilarRecommendationResponse row = new SimilarRecommendationResponse();
            row.setProductId(s.product.getId());
            row.setProductName(s.product.getProductName());
            row.setSku(s.product.getSku());
            row.setCategoryId(s.product.getCategoryId());
            BigDecimal p = effectivePrice(s.product);
            row.setPrice(p != null ? p.setScale(2, RoundingMode.HALF_UP) : null);
            row.setPriceDelta(s.priceGap.setScale(2, RoundingMode.HALF_UP));
            row.setReason("Cùng danh mục, giá gần sản phẩm hiện tại");
            return row;
        }).collect(Collectors.toList());
    }

    @Override
    public void deleteRecommendation(Long id) {
        recommendationRepository.deleteById(id);
    }

	@Override
	public Recommendation getRecommendationById(Long recommendationId) {
		return recommendationRepository.getOne(recommendationId);
	}

    private BigDecimal effectivePrice(Product p) {
        if (p == null) return null;
        if (p.getEffectivePrice() != null && p.getEffectivePrice().compareTo(BigDecimal.ZERO) > 0) {
            return p.getEffectivePrice();
        }
        if (p.getPrice() != null && p.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            return p.getPrice();
        }
        return null;
    }

    private static class ScoredProduct {
        private final Product product;
        private final BigDecimal priceGap;

        private ScoredProduct(Product product, BigDecimal priceGap) {
            this.product = product;
            this.priceGap = priceGap;
        }
    }
}
