package com.rainbowforest.saleservice.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Lịch sử sử dụng voucher — đảm bảo mỗi user chỉ dùng 1 voucher 1 lần.
 * UNIQUE constraint: (voucher_id, user_id)
 */
@Entity
@Table(name = "voucher_usages",
        uniqueConstraints = @UniqueConstraint(columnNames = {"voucher_id", "user_id"}, name = "uk_voucher_user"))
public class VoucherUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "voucher_id", nullable = false)
    private Long voucherId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt = LocalDateTime.now();

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
