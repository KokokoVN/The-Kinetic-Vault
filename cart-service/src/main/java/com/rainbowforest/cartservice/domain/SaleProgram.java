package com.rainbowforest.cartservice.domain;

import java.math.BigDecimal;
import java.util.List;

public class SaleProgram {
    private String discountType;
    private BigDecimal discountValue;
    private List<SaleProgramItem> items;

    public String getDiscountType() {
        return discountType;
    }
    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }
    public BigDecimal getDiscountValue() {
        return discountValue;
    }
    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }
    public List<SaleProgramItem> getItems() {
        return items;
    }
    public void setItems(List<SaleProgramItem> items) {
        this.items = items;
    }
}
