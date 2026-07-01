package com.rainbowforest.userservice.dto;

public class ProfileAvatarUploadRequest {
    private String avatarUrl;
    private String performedBy;

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
}
