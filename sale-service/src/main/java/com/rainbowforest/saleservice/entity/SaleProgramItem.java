package com.rainbowforest.saleservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;

/**
 * Áp dụng một SaleProgram cho một sản phẩm (productId) hoặc biến thể (variantId).
 * Constraint: cùng productId+variantId không được có 2 chương trình overlap thời gian.
 */
@Entity
@Table(name = "sale_program_items")
public class SaleProgramItem extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sale_program_id", nullable = false)
    @JsonIgnore
    private SaleProgram saleProgram;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    /**
     * null → áp dụng cho toàn bộ sản phẩm (không gắn biến thể cụ thể)
     */
    @Column(name = "variant_id")
    private Long variantId;

    /**
     * Số lượng tối đa áp dụng khuyến mãi. Không được vượt tồn kho thực tế.
     */
    @Column(name = "promo_qty_limit")
    private Integer promoQtyLimit;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SaleProgram getSaleProgram() { return saleProgram; }
    public void setSaleProgram(SaleProgram saleProgram) { this.saleProgram = saleProgram; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }
    public Integer getPromoQtyLimit() { return promoQtyLimit; }
    public void setPromoQtyLimit(Integer promoQtyLimit) { this.promoQtyLimit = promoQtyLimit; }

    /** Expose program id for JSON serialization convenience */
    public Long getSaleProgramId() {
        return saleProgram != null ? saleProgram.getId() : null;
    }
}
