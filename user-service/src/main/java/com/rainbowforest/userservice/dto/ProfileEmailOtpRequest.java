package com.rainbowforest.userservice.dto;

public class ProfileEmailOtpRequest {
    private String newEmail;
    private String performedBy;

    public String getNewEmail() { return newEmail; }
    public void setNewEmail(String newEmail) { this.newEmail = newEmail; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
}
