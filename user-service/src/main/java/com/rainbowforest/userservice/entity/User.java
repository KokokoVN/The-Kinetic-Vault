package com.rainbowforest.userservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table (name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User extends AuditableEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (name = "user_name", nullable = false, unique = true, length = 50)
    private String userName;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column (name = "user_password", nullable = false, length = 255)
    private String userPassword;

    @Column(name = "email", unique = true, length = 120)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    @Column(name = "phone_verified_at")
    private LocalDateTime phoneVerifiedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "last_login_ip", length = 64)
    private String lastLoginIp;

    @Column(name = "last_login_device_fingerprint", length = 190)
    private String lastLoginDeviceFingerprint;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    @Column(name = "email_changed_at")
    private LocalDateTime emailChangedAt;

    @Column(name = "membership_level", length = 50)
    private String membershipLevel = "BRONZE";

    @Column(name = "is_2fa_enabled")
    private Boolean is2faEnabled = false;

    @Column(name = "totp_secret", length = 100)
    private String totpSecret;

    @Column(name = "total_spent", precision = 19, scale = 2, nullable = false)
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @Column(name = "completed_orders_count", nullable = false)
    private Long completedOrdersCount = 0L;

    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts = 0;

    @Column(name = "lockout_end_time")
    private LocalDateTime lockoutEndTime;

    @Column (name = "is_activated", nullable = false)
    private boolean activated = false;

    @OneToOne (cascade = CascadeType.ALL)
    @JoinColumn (name = "user_details_id")
    private UserDetails userDetails;

    @ManyToOne
    @JoinColumn (name = "role_id")
    private UserRole role;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getUserPassword() {
		return userPassword;
	}

	public void setUserPassword(String userPassword) {
		this.userPassword = userPassword;
	}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public boolean isActivated() {
        return activated;
    }

    public boolean getActivated() {
        return activated;
    }

    public LocalDateTime getEmailVerifiedAt() {
        return emailVerifiedAt;
    }

    public void setEmailVerifiedAt(LocalDateTime emailVerifiedAt) {
        this.emailVerifiedAt = emailVerifiedAt;
    }

    public LocalDateTime getPhoneVerifiedAt() {
        return phoneVerifiedAt;
    }

    public void setPhoneVerifiedAt(LocalDateTime phoneVerifiedAt) {
        this.phoneVerifiedAt = phoneVerifiedAt;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public String getLastLoginIp() {
        return lastLoginIp;
    }

    public void setLastLoginIp(String lastLoginIp) {
        this.lastLoginIp = lastLoginIp;
    }

    public String getLastLoginDeviceFingerprint() {
        return lastLoginDeviceFingerprint;
    }

    public void setLastLoginDeviceFingerprint(String lastLoginDeviceFingerprint) {
        this.lastLoginDeviceFingerprint = lastLoginDeviceFingerprint;
    }

    public LocalDateTime getPasswordChangedAt() {
        return passwordChangedAt;
    }

    public void setPasswordChangedAt(LocalDateTime passwordChangedAt) {
        this.passwordChangedAt = passwordChangedAt;
    }

    public LocalDateTime getEmailChangedAt() {
        return emailChangedAt;
    }

    public void setEmailChangedAt(LocalDateTime emailChangedAt) {
        this.emailChangedAt = emailChangedAt;
    }

    public String getMembershipLevel() {
        return membershipLevel;
    }

    public void setMembershipLevel(String membershipLevel) {
        this.membershipLevel = membershipLevel;
    }

    public Boolean getIs2faEnabled() {
        return is2faEnabled;
    }

    public void setIs2faEnabled(Boolean is2faEnabled) {
        this.is2faEnabled = is2faEnabled;
    }

    public String getTotpSecret() {
        return totpSecret;
    }

    public void setTotpSecret(String totpSecret) {
        this.totpSecret = totpSecret;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }

    public Long getCompletedOrdersCount() {
        return completedOrdersCount;
    }

    public void setCompletedOrdersCount(Long completedOrdersCount) {
        this.completedOrdersCount = completedOrdersCount;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public LocalDateTime getLockoutEndTime() {
        return lockoutEndTime;
    }

    public void setLockoutEndTime(LocalDateTime lockoutEndTime) {
        this.lockoutEndTime = lockoutEndTime;
    }

	public UserDetails getUserDetails() {
		return userDetails;
	}

	public void setUserDetails(UserDetails userDetails) {
		this.userDetails = userDetails;
	}

	public UserRole getRole() {
		return role;
	}

	public void setRole(UserRole role) {
		this.role = role;
	}
}
