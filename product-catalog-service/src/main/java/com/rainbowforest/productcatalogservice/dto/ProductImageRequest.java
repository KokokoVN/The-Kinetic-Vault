package com.rainbowforest.productcatalogservice.dto;

import javax.validation.constraints.NotNull;

public class ProductImageRequest {

    @NotNull
    private String storagePath;
    private String imageUrl;
    private Integer sortOrder;
    private Boolean primaryImage;
    private String performedBy;
    private String mediaType;

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Boolean getPrimaryImage() {
        return primaryImage;
    }

    public void setPrimaryImage(Boolean primaryImage) {
        this.primaryImage = primaryImage;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }
}
