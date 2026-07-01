package com.rainbowforest.recommendationservice.dto;

public class ManualRecommendationResponse {
    private Long id;
    private Long sourceProductId;
    private Long targetProductId;
    private Integer sortOrder;
    private String reason;
    private TargetProduct targetProduct;

    public ManualRecommendationResponse() {
    }

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

    public TargetProduct getTargetProduct() {
        return targetProduct;
    }

    public void setTargetProduct(TargetProduct targetProduct) {
        this.targetProduct = targetProduct;
    }

    public static class TargetProduct {
        private Long id;
        private String productName;
        private String sku;

        public TargetProduct() {
        }

        public TargetProduct(Long id, String productName, String sku) {
            this.id = id;
            this.productName = productName;
            this.sku = sku;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public String getSku() {
            return sku;
        }

        public void setSku(String sku) {
            this.sku = sku;
        }
    }
}

