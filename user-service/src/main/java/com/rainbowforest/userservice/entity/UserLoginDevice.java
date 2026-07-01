package com.rainbowforest.userservice.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_login_devices", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_login_device_fingerprint", columnNames = {"user_id", "device_fingerprint"})
})
public class UserLoginDevice {

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

    @Column(name = "last_login_ip", length = 64)
    private String lastLoginIp;

    @Column(name = "last_login_location", length = 255)
    private String lastLoginLocation;

    @Column(name = "last_login_timezone", length = 80)
    private String lastLoginTimezone;

    @Column(name = "last_login_locale", length = 80)
    private String lastLoginLocale;

    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt;

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

    public String getLastLoginIp() {
        return lastLoginIp;
    }

    public void setLastLoginIp(String lastLoginIp) {
        this.lastLoginIp = lastLoginIp;
    }

    public String getLastLoginLocation() {
        return lastLoginLocation;
    }

    public void setLastLoginLocation(String lastLoginLocation) {
        this.lastLoginLocation = lastLoginLocation;
    }

    public String getLastLoginTimezone() {
        return lastLoginTimezone;
    }

    public void setLastLoginTimezone(String lastLoginTimezone) {
        this.lastLoginTimezone = lastLoginTimezone;
    }

    public String getLastLoginLocale() {
        return lastLoginLocale;
    }

    public void setLastLoginLocale(String lastLoginLocale) {
        this.lastLoginLocale = lastLoginLocale;
    }

    public LocalDateTime getLastSeenAt() {
        return lastSeenAt;
    }

    public void setLastSeenAt(LocalDateTime lastSeenAt) {
        this.lastSeenAt = lastSeenAt;
    }
}
