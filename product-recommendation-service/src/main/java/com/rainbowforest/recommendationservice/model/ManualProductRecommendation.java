package com.rainbowforest.recommendationservice.model;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "manual_product_recommendations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_manual_rec_source_target", columnNames = {"source_product_id", "target_product_id"})
}, indexes = {
        @Index(name = "idx_manual_rec_source", columnList = "source_product_id")
})
public class ManualProductRecommendation extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "source_product_id", nullable = false)
    private Long sourceProductId;

    @NotNull
    @Column(name = "target_product_id", nullable = false)
    private Long targetProductId;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "reason", length = 200)
    private String reason;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSourceProductId() {
        return sourceProductId;
    }

    public void setSourceProductId(Long sourceProductId) {
        this.sourceProductId = sourceProductId;
    }

    public Long getTargetProductId() {
        return targetProductId;
    }

    public void setTargetProductId(Long targetProductId) {
        this.targetProductId = targetProductId;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

