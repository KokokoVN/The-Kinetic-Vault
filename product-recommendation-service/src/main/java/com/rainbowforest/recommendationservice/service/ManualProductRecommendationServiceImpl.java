package com.rainbowforest.recommendationservice.service;

import com.rainbowforest.recommendationservice.feignClient.ProductClient;
import com.rainbowforest.recommendationservice.model.ManualProductRecommendation;
import com.rainbowforest.recommendationservice.model.Product;
import com.rainbowforest.recommendationservice.repository.ManualProductRecommendationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ManualProductRecommendationServiceImpl implements ManualProductRecommendationService {

    private final ManualProductRecommendationRepository repository;
    private final ProductClient productClient;

    public ManualProductRecommendationServiceImpl(
            ManualProductRecommendationRepository repository,
            ProductClient productClient
    ) {
        this.repository = repository;
        this.productClient = productClient;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ManualProductRecommendation> listForSourceProduct(Long sourceProductId) {
        return repository.findBySourceProductIdOrderBySortOrderAscIdAsc(sourceProductId);
    }

    @Override
    public ManualProductRecommendation create(Long sourceProductId, Long targetProductId, Integer sortOrder, String reason, String performedBy) {
        if (sourceProductId == null || targetProductId == null) {
            throw new IllegalArgumentException("Thiếu sourceProductId/targetProductId");
        }
        if (sourceProductId.equals(targetProductId)) {
            throw new IllegalArgumentException("Không thể tự gợi ý chính nó");
        }
        if (repository.existsBySourceProductIdAndTargetProductId(sourceProductId, targetProductId)) {
            throw new IllegalArgumentException("Gợi ý này đã tồn tại");
        }

        // Validate sản phẩm tồn tại (qua catalog service)
        Product source = productClient.getProductById(sourceProductId);
        Product target = productClient.getProductById(targetProductId);
        if (source == null) {
            throw new IllegalArgumentException("Không tìm thấy sản phẩm nguồn " + sourceProductId);
        }
        if (target == null) {
            throw new IllegalArgumentException("Không tìm thấy sản phẩm gợi ý " + targetProductId);
        }

        ManualProductRecommendation row = new ManualProductRecommendation();
        row.setSourceProductId(sourceProductId);
        row.setTargetProductId(targetProductId);
        row.setSortOrder(sortOrder);
        row.setReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : null);
        if (performedBy != null && !performedBy.trim().isEmpty()) {
            row.setCreatedBy(performedBy.trim());
            row.setUpdatedBy(performedBy.trim());
        }
        return repository.save(row);
    }

    @Override
    public void delete(Long sourceProductId, Long id, String performedBy) {
        ManualProductRecommendation row = repository.findByIdAndSourceProductId(id, sourceProductId).orElse(null);
        if (row == null) {
            throw new IllegalArgumentException("Không tìm thấy recommendation");
        }
        if (performedBy != null && !performedBy.trim().isEmpty()) {
            row.setDeletedBy(performedBy.trim());
        }
        repository.delete(row);
    }
}

