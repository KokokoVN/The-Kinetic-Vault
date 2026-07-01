package com.rainbowforest.orderservice.dto;

import java.math.BigDecimal;

public class UserStatsUpdateRequest {
    private BigDecimal totalSpentToAdd;
    private Long completedOrdersToAdd;

    public UserStatsUpdateRequest() {}

    public UserStatsUpdateRequest(BigDecimal totalSpentToAdd, Long completedOrdersToAdd) {
        this.totalSpentToAdd = totalSpentToAdd;
        this.completedOrdersToAdd = completedOrdersToAdd;
    }

    public BigDecimal getTotalSpentToAdd() {
        return totalSpentToAdd;
    }

    public void setTotalSpentToAdd(BigDecimal totalSpentToAdd) {
        this.totalSpentToAdd = totalSpentToAdd;
    }

    public Long getCompletedOrdersToAdd() {
        return completedOrdersToAdd;
    }

    public void setCompletedOrdersToAdd(Long completedOrdersToAdd) {
        this.completedOrdersToAdd = completedOrdersToAdd;
    }
}
