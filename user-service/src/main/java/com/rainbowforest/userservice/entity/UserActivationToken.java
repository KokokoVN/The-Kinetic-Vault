package com.rainbowforest.userservice.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_activation_tokens")
public class UserActivationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token", nullable = false, unique = true, length = 120)
    private String token;

    @Column(name = "otp_code", length = 10)
    private String otpCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "delivery_channel", length = 20)
    private String deliveryChannel;

    @Column(name = "recipient", length = 120)
    private String recipient;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getDeliveryChannel() {
        return deliveryChannel;
    }

    public void setDeliveryChannel(String deliveryChannel) {
        this.deliveryChannel = deliveryChannel;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }
}

