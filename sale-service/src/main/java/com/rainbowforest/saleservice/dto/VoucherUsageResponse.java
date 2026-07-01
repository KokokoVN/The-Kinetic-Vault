package com.rainbowforest.saleservice.dto;

import java.time.LocalDateTime;

public class VoucherUsageResponse {
    private Long id;
    private Long voucherId;
    private Long userId;
    private Long orderId;
    private LocalDateTime usedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getVoucherId() { return voucherId; }
    public void setVoucherId(Long voucherId) { this.voucherId = voucherId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }
}
