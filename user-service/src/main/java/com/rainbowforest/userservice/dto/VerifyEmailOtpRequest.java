package com.rainbowforest.userservice.dto;

public class VerifyEmailOtpRequest {
    private String otp;
    private String newEmail;
    private String performedBy;

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    public String getNewEmail() { return newEmail; }
    public void setNewEmail(String newEmail) { this.newEmail = newEmail; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
}
