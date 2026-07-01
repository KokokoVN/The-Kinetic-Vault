package com.rainbowforest.userservice.dto;

public class EmailOtpRequest {
    private String newEmail;
    private String oldEmail;
    private String performedBy;

    public String getNewEmail() { return newEmail; }
    public void setNewEmail(String newEmail) { this.newEmail = newEmail; }

    public String getOldEmail() { return oldEmail; }
    public void setOldEmail(String oldEmail) { this.oldEmail = oldEmail; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
}
