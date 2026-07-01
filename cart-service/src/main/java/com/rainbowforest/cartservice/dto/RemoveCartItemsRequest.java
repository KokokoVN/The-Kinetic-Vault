package com.rainbowforest.cartservice.dto;

import java.util.List;

public class RemoveCartItemsRequest {
    private List<SelectedItem> items;

    public List<SelectedItem> getItems() {
        return items;
    }

    public void setItems(List<SelectedItem> items) {
        this.items = items;
    }

    public static class SelectedItem {
        private Long productId;
        private Long variantId;

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public Long getVariantId() {
            return variantId;
        }

        public void setVariantId(Long variantId) {
            this.variantId = variantId;
        }
    }
}
