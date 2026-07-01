package com.rainbowforest.userservice.dto;

import javax.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank
    private String username;
    @NotBlank
    private String password;
    private String deviceLabel;
    private String timeZone;
    private String locale;
    private String location;
    private String deviceFingerprint;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDeviceLabel() {
        return deviceLabel;
    }

    public void setDeviceLabel(String deviceLabel) {
        this.deviceLabel = deviceLabel;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDeviceFingerprint() {
        return deviceFingerprint;
    }

    public void setDeviceFingerprint(String deviceFingerprint) {
        this.deviceFingerprint = deviceFingerprint;
    }
}
