package com.rainbowforest.saleservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SaleProgramRequest {
    private String name;
    private String description;
    private String discountType; // PERCENT | AMOUNT
    private BigDecimal discountValue;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Boolean active = true;
    private Boolean sendEmailNotification = false;
    private List<ItemRequest> items;

    public static class ItemRequest {
        private Long productId;
        private Long variantId;
        private Integer promoQtyLimit;
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Long getVariantId() { return variantId; }
        public void setVariantId(Long variantId) { this.variantId = variantId; }
        public Integer getPromoQtyLimit() { return promoQtyLimit; }
        public void setPromoQtyLimit(Integer promoQtyLimit) { this.promoQtyLimit = promoQtyLimit; }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }
    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }
    public LocalDateTime getStartAt() { return startAt; }
    public void setStartAt(LocalDateTime startAt) { this.startAt = startAt; }
    public LocalDateTime getEndAt() { return endAt; }
    public void setEndAt(LocalDateTime endAt) { this.endAt = endAt; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Boolean getSendEmailNotification() { return sendEmailNotification; }
    public void setSendEmailNotification(Boolean sendEmailNotification) { this.sendEmailNotification = sendEmailNotification; }
    public List<ItemRequest> getItems() { return items; }
    public void setItems(List<ItemRequest> items) { this.items = items; }
}
