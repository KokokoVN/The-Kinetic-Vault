package com.rainbowforest.orderservice.dto;

import java.util.List;

public class CodCheckoutRequest {
    private Long userId;
    private String shippingAddress;
    private String phoneNumber;
    private BuyNowItem buyNowItem;
    private List<SelectedCartItem> selectedCartItems;
    private String voucherCode;

    public String getVoucherCode() {
        return voucherCode;
    }

    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public BuyNowItem getBuyNowItem() {
        return buyNowItem;
    }

    public void setBuyNowItem(BuyNowItem buyNowItem) {
        this.buyNowItem = buyNowItem;
    }

    public List<SelectedCartItem> getSelectedCartItems() {
        return selectedCartItems;
    }

    public void setSelectedCartItems(List<SelectedCartItem> selectedCartItems) {
        this.selectedCartItems = selectedCartItems;
    }

    public static class BuyNowItem {
        private Long productId;
        private Integer quantity;
        private Long variantId;
        private String variantLabel;

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public Long getVariantId() {
            return variantId;
        }

        public void setVariantId(Long variantId) {
            this.variantId = variantId;
        }

        public String getVariantLabel() {
            return variantLabel;
        }

        public void setVariantLabel(String variantLabel) {
            this.variantLabel = variantLabel;
        }
    }

    public static class SelectedCartItem {
        private Long productId;
        private Long variantId;
        private Integer quantity;
        private String variantLabel;
        private java.math.BigDecimal subTotal;

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

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public String getVariantLabel() {
            return variantLabel;
        }

        public void setVariantLabel(String variantLabel) {
            this.variantLabel = variantLabel;
        }

        public java.math.BigDecimal getSubTotal() {
            return subTotal;
        }

        public void setSubTotal(java.math.BigDecimal subTotal) {
            this.subTotal = subTotal;
        }
    }
}
