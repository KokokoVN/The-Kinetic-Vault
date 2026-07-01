package com.rainbowforest.userservice.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_login_device_approval_tokens")
public class UserLoginDeviceApprovalToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "device_fingerprint", nullable = false, length = 190)
    private String deviceFingerprint;

    @Column(name = "device_label", length = 255)
    private String deviceLabel;

    @Column(name = "otp_code", length = 10)
    private String otpCode;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "location_label", length = 255)
    private String locationLabel;

    @Column(name = "timezone_label", length = 80)
    private String timezoneLabel;

    @Column(name = "locale_label", length = 80)
    private String localeLabel;

    @Column(name = "token", nullable = false, unique = true, length = 120)
    private String token;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDeviceFingerprint() {
        return deviceFingerprint;
    }

    public void setDeviceFingerprint(String deviceFingerprint) {
        this.deviceFingerprint = deviceFingerprint;
    }

    public String getDeviceLabel() {
        return deviceLabel;
    }

    public void setDeviceLabel(String deviceLabel) {
        this.deviceLabel = deviceLabel;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getLocationLabel() {
        return locationLabel;
    }

    public void setLocationLabel(String locationLabel) {
        this.locationLabel = locationLabel;
    }

    public String getTimezoneLabel() {
        return timezoneLabel;
    }

    public void setTimezoneLabel(String timezoneLabel) {
        this.timezoneLabel = timezoneLabel;
    }

    public String getLocaleLabel() {
        return localeLabel;
    }

    public void setLocaleLabel(String localeLabel) {
        this.localeLabel = localeLabel;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }
}
