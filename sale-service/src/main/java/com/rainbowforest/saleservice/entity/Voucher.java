package com.rainbowforest.saleservice.entity;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Voucher giảm giá. Hỗ trợ PERCENT và AMOUNT.
 * Mỗi voucher có thể dùng tối đa maxUsage lần toàn hệ thống,
 * và mỗi user chỉ được dùng đúng 1 lần (kiểm tra qua VoucherUsage).
 */
@Entity
@Table(name = "vouchers")
public class Voucher extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 64)
    private String code;

    @Column(name = "description", length = 500)
    private String description;

    /** PERCENT or AMOUNT */
    @Column(name = "discount_type", nullable = false, length = 16)
    private String discountType;

    @Column(name = "discount_value", nullable = false, precision = 18, scale = 4)
    private BigDecimal discountValue;

    /** Đơn hàng tối thiểu để áp dụng voucher */
    @Column(name = "min_order_amount", precision = 18, scale = 2)
    private BigDecimal minOrderAmount;

    /** Giảm tối đa (áp dụng cho PERCENT để giới hạn mức giảm) */
    @Column(name = "max_discount_amount", precision = 18, scale = 2)
    private BigDecimal maxDiscountAmount;

    /** Tổng số lần có thể dùng (toàn hệ thống) */
    @Column(name = "max_usage")
    private Integer maxUsage;

    /** Giới hạn số lần dùng mỗi user */
    @Column(name = "max_usage_per_user")
    private Integer maxUsagePerUser = 1;

    /** Số lần đã dùng */
    @Column(name = "usage_count", nullable = false)
    private Integer usageCount = 0;

    @Column(name = "starts_at")
    private LocalDateTime startsAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }
    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }
    public BigDecimal getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; }
    public BigDecimal getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(BigDecimal maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }
    public Integer getMaxUsage() { return maxUsage; }
    public void setMaxUsage(Integer maxUsage) { this.maxUsage = maxUsage; }
    public Integer getMaxUsagePerUser() { return maxUsagePerUser; }
    public void setMaxUsagePerUser(Integer maxUsagePerUser) { this.maxUsagePerUser = maxUsagePerUser; }
    public Integer getUsageCount() { return usageCount; }
    public void setUsageCount(Integer usageCount) { this.usageCount = usageCount; }
    public LocalDateTime getStartsAt() { return startsAt; }
    public void setStartsAt(LocalDateTime startsAt) { this.startsAt = startsAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public boolean isNotYetStarted() {
        return startsAt != null && LocalDateTime.now().isBefore(startsAt);
    }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    public boolean isExhausted() {
        return maxUsage != null && usageCount >= maxUsage;
    }
}
