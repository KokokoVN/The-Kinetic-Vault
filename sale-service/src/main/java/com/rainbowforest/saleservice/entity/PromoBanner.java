package com.rainbowforest.saleservice.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Banner quảng cáo / khuyến mãi hiển thị trên storefront.
 */
@Entity
@Table(name = "promo_banners")
public class PromoBanner extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    /** Thứ tự hiển thị (nhỏ hơn = ưu tiên hơn) */
    @Column(name = "position")
    private Integer position = 0;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getLinkUrl() { return linkUrl; }
    public void setLinkUrl(String linkUrl) { this.linkUrl = linkUrl; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getStartAt() { return startAt; }
    public void setStartAt(LocalDateTime startAt) { this.startAt = startAt; }
    public LocalDateTime getEndAt() { return endAt; }
    public void setEndAt(LocalDateTime endAt) { this.endAt = endAt; }
}
