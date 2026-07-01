package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Lưu nhật ký lịch sử thay đổi của sản phẩm.
 * Ghi lại mỗi khi sản phẩm, biến thể, hoặc thông số kỹ thuật được tạo / cập nhật / xóa.
 */
@Entity
@Table(name = "product_change_logs", indexes = {
        @Index(name = "idx_pcl_product_id", columnList = "product_id"),
        @Index(name = "idx_pcl_changed_at", columnList = "changed_at")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductChangeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID sản phẩm liên quan. */
    @Column(name = "product_id", nullable = false)
    private Long productId;

    /**
     * Loại hành động / trường bị thay đổi.
     * Ví dụ: "productName", "price", "brand", "category", "variant_added", "spec_updated", ...
     */
    @Column(name = "changed_field", length = 120, nullable = false)
    private String changedField;

    /** Giá trị cũ (trước khi thay đổi). Có thể null nếu là tạo mới. */
    @Column(name = "old_value", length = 2000)
    private String oldValue;

    /** Giá trị mới (sau khi thay đổi). Có thể null nếu là xóa. */
    @Column(name = "new_value", length = 2000)
    private String newValue;

    /** Thời điểm thay đổi. */
    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    /** Tên tài khoản thực hiện thay đổi. */
    @Column(name = "changed_by", length = 120)
    private String changedBy;

    /** ID người thực hiện thay đổi (nếu có). */
    @Column(name = "changed_by_user_id", length = 64)
    private String changedByUserId;

    @PrePersist
    public void prePersist() {
        if (changedAt == null) {
            changedAt = LocalDateTime.now();
        }
    }

    public ProductChangeLog() {
    }

    public ProductChangeLog(Long productId, String changedField, String oldValue, String newValue,
                            String changedBy, String changedByUserId) {
        this.productId = productId;
        this.changedField = changedField;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.changedBy = changedBy;
        this.changedByUserId = changedByUserId;
        this.changedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getChangedField() {
        return changedField;
    }

    public void setChangedField(String changedField) {
        this.changedField = changedField;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public String getChangedByUserId() {
        return changedByUserId;
    }

    public void setChangedByUserId(String changedByUserId) {
        this.changedByUserId = changedByUserId;
    }
}
