package com.rainbowforest.saleservice.dto;

import com.rainbowforest.saleservice.entity.PromoBanner;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO nhẹ (Serializable) để cache danh sách banner đang active.
 */
public class PromoBannerCacheDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private Integer position;
    private Boolean active;
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    public PromoBannerCacheDto() {}

    public static PromoBannerCacheDto from(PromoBanner b) {
        PromoBannerCacheDto dto = new PromoBannerCacheDto();
        dto.id = b.getId();
        dto.title = b.getTitle();
        dto.imageUrl = b.getImageUrl();
        dto.linkUrl = b.getLinkUrl();
        dto.position = b.getPosition();
        dto.active = b.getActive();
        dto.startAt = b.getStartAt();
        dto.endAt = b.getEndAt();
        return dto;
    }

    public static List<PromoBannerCacheDto> fromList(List<PromoBanner> banners) {
        if (banners == null) return null;
        return banners.stream().map(PromoBannerCacheDto::from).collect(Collectors.toList());
    }

    public PromoBanner toEntity() {
        PromoBanner b = new PromoBanner();
        b.setId(this.id);
        b.setTitle(this.title);
        b.setImageUrl(this.imageUrl);
        b.setLinkUrl(this.linkUrl);
        b.setPosition(this.position);
        b.setActive(this.active);
        b.setStartAt(this.startAt);
        b.setEndAt(this.endAt);
        return b;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getImageUrl() { return imageUrl; }
    public String getLinkUrl() { return linkUrl; }
    public Integer getPosition() { return position; }
    public Boolean getActive() { return active; }
    public LocalDateTime getStartAt() { return startAt; }
    public LocalDateTime getEndAt() { return endAt; }
}
