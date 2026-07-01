package com.rainbowforest.orderservice.dto;

import java.util.List;

public class ManualOrderCreateRequest {
    private Long userId;
    private String shippingAddress;
    /** SĐT nhận hàng (ưu tiên khi ghép phoneLast4 cho đơn). */
    private String phoneNumber;
    /** COD / BANK_TRANSFER / CARD. Nếu null thì default COD. */
    private String paymentMethod;
    private String voucherCode;
    private List<LineItem> items;

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

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public List<LineItem> getItems() {
        return items;
    }

    public void setItems(List<LineItem> items) {
        this.items = items;
    }

    public static class LineItem {
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
}
