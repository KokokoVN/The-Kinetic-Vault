package com.rainbowforest.productcatalogservice.dto;

import java.util.List;

public class InventoryTemplateRequestDto {
    private List<Long> productIds;
    private List<Long> variantIds;

    public List<Long> getProductIds() {
        return productIds;
    }

    public void setProductIds(List<Long> productIds) {
        this.productIds = productIds;
    }

    public List<Long> getVariantIds() {
        return variantIds;
    }

    public void setVariantIds(List<Long> variantIds) {
        this.variantIds = variantIds;
    }
}
