package com.rainbowforest.recommendationservice.config;

import com.rainbowforest.recommendationservice.model.ManualProductRecommendation;
import com.rainbowforest.recommendationservice.model.Product;
import com.rainbowforest.recommendationservice.model.Recommendation;
import com.rainbowforest.recommendationservice.repository.ManualProductRecommendationRepository;
import com.rainbowforest.recommendationservice.repository.ProductRepository;
import com.rainbowforest.recommendationservice.repository.RecommendationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class RecommendationDataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final RecommendationRepository recommendationRepository;
    private final ManualProductRecommendationRepository manualProductRecommendationRepository;

    public RecommendationDataInitializer(
            ProductRepository productRepository,
            RecommendationRepository recommendationRepository,
            ManualProductRecommendationRepository manualProductRecommendationRepository
    ) {
        this.productRepository = productRepository;
        this.recommendationRepository = recommendationRepository;
        this.manualProductRecommendationRepository = manualProductRecommendationRepository;
    }

    @Override
    public void run(String... args) {
        Product p1 = upsertProduct("SKU-DEMO-001", "Ao thun cotton basic");
        Product p2 = upsertProduct("SKU-DEMO-003", "Sneaker urban x");
        Product p3 = upsertProduct("SKU-DEMO-010", "Balo laptop urban");

        seedRating(1L, "alice", p1, 5);
        seedRating(1L, "alice", p2, 4);
        seedRating(2L, "bob", p1, 4);
        seedRating(2L, "bob", p3, 5);
        seedRating(3L, "charlie", p2, 5);
        seedRating(3L, "charlie", p3, 3);

        seedManual(p1.getId(), p2.getId(), 1, "Nguoi mua ao thuong mua giay");
        seedManual(p1.getId(), p3.getId(), 2, "Goi y mix do voi phu kien");
        seedManual(p2.getId(), p1.getId(), 1, "Set do co ban");
    }

    private Product upsertProduct(String sku, String name) {
        Product existing = productRepository.findBySku(sku);
        if (existing != null) {
            return existing;
        }
        Product p = new Product();
        p.setSku(sku);
        p.setProductName(name);
        return productRepository.save(p);
    }

    private void seedRating(Long userId, String userName, Product product, int rating) {
        if (recommendationRepository.existsByUserIdAndProduct_Id(userId, product.getId())) {
            return;
        }
        Recommendation r = new Recommendation();
        r.setUserId(userId);
        r.setUserName(userName);
        r.setProduct(product);
        r.setRating(rating);
        recommendationRepository.save(r);
    }

    private void seedManual(Long sourceProductId, Long targetProductId, int sortOrder, String reason) {
        if (manualProductRecommendationRepository.existsBySourceProductIdAndTargetProductId(sourceProductId, targetProductId)) {
            return;
        }
        ManualProductRecommendation row = new ManualProductRecommendation();
        row.setSourceProductId(sourceProductId);
        row.setTargetProductId(targetProductId);
        row.setSortOrder(sortOrder);
        row.setReason(reason);
        manualProductRecommendationRepository.save(row);
    }
}
