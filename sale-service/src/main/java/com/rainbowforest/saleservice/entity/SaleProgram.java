package com.rainbowforest.saleservice.entity;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Đại diện một chương trình khuyến mãi (sale program).
 * Một chương trình có thể áp dụng cho nhiều sản phẩm / biến thể (via SaleProgramItem).
 */
@Entity
@Table(name = "sale_programs")
public class SaleProgram extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * PERCENT: giảm theo %, AMOUNT: giảm số tiền cố định
     */
    @Column(name = "discount_type", nullable = false, length = 16)
    private String discountType; // "PERCENT" | "AMOUNT"

    @Column(name = "discount_value", nullable = false, precision = 18, scale = 4)
    private BigDecimal discountValue;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "saleProgram", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SaleProgramItem> items = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public List<SaleProgramItem> getItems() { return items; }
    public void setItems(List<SaleProgramItem> items) { this.items = items; }
}
