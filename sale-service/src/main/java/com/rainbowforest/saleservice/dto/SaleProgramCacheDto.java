package com.rainbowforest.saleservice.dto;

import com.rainbowforest.saleservice.entity.PromoBanner;
import com.rainbowforest.saleservice.entity.SaleProgram;
import com.rainbowforest.saleservice.entity.SaleProgramItem;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO nhẹ (Serializable) để cache danh sách chương trình khuyến mãi đang active.
 * Tránh LazyInitializationException và cho phép Spring cache (in-memory / Redis)
 * serialize/deserialize an toàn.
 */
public class SaleProgramCacheDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Boolean active;
    private List<Item> items;

    public SaleProgramCacheDto() {}

    public static SaleProgramCacheDto from(SaleProgram sp) {
        SaleProgramCacheDto dto = new SaleProgramCacheDto();
        dto.id = sp.getId();
        dto.name = sp.getName();
        dto.description = sp.getDescription();
        dto.discountType = sp.getDiscountType();
        dto.discountValue = sp.getDiscountValue();
        dto.startAt = sp.getStartAt();
        dto.endAt = sp.getEndAt();
        dto.active = sp.getActive();
        dto.items = sp.getItems() == null ? null :
            sp.getItems().stream().map(Item::from).collect(Collectors.toList());
        return dto;
    }

    public static List<SaleProgramCacheDto> fromList(List<SaleProgram> programs) {
        if (programs == null) return null;
        return programs.stream().map(SaleProgramCacheDto::from).collect(Collectors.toList());
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getDiscountType() { return discountType; }
    public BigDecimal getDiscountValue() { return discountValue; }
    public LocalDateTime getStartAt() { return startAt; }
    public LocalDateTime getEndAt() { return endAt; }
    public Boolean getActive() { return active; }
    public List<Item> getItems() { return items; }

    /**
     * Convert ngược về entity (chỉ dùng cho mục đích đọc hiển thị, KHÔNG dùng để save).
     */
    public SaleProgram toEntity() {
        SaleProgram sp = new SaleProgram();
        sp.setId(this.id);
        sp.setName(this.name);
        sp.setDescription(this.description);
        sp.setDiscountType(this.discountType);
        sp.setDiscountValue(this.discountValue);
        sp.setStartAt(this.startAt);
        sp.setEndAt(this.endAt);
        sp.setActive(this.active);
        if (this.items != null) {
            sp.setItems(this.items.stream().map(Item::toEntity).collect(Collectors.toList()));
        }
        return sp;
    }

    public static class Item implements Serializable {
        private static final long serialVersionUID = 1L;

        private Long id;
        private Long productId;
        private Long variantId;
        private Integer promoQtyLimit;
        private Long saleProgramId;

        public static Item from(SaleProgramItem i) {
            Item dto = new Item();
            dto.id = i.getId();
            dto.productId = i.getProductId();
            dto.variantId = i.getVariantId();
            dto.promoQtyLimit = i.getPromoQtyLimit();
            dto.saleProgramId = i.getSaleProgramId();
            return dto;
        }

        public SaleProgramItem toEntity() {
            SaleProgramItem i = new SaleProgramItem();
            i.setId(this.id);
            i.setProductId(this.productId);
            i.setVariantId(this.variantId);
            i.setPromoQtyLimit(this.promoQtyLimit);
            return i;
        }

        public Long getId() { return id; }
        public Long getProductId() { return productId; }
        public Long getVariantId() { return variantId; }
        public Integer getPromoQtyLimit() { return promoQtyLimit; }
        public Long getSaleProgramId() { return saleProgramId; }
    }
}
