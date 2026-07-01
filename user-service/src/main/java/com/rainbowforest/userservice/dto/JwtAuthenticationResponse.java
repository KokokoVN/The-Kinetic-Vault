package com.rainbowforest.userservice.dto;

public class JwtAuthenticationResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private long expiresInMs;
    private long refreshExpiresInMs;
    private Long userId;
    private String username;
    private String role;

    public JwtAuthenticationResponse() {
    }

    public JwtAuthenticationResponse(String accessToken, String refreshToken, long expiresInMs, long refreshExpiresInMs,
                                     Long userId, String username, String role) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresInMs = expiresInMs;
        this.refreshExpiresInMs = refreshExpiresInMs;
        this.userId = userId;
        this.username = username;
        this.role = role;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresInMs() {
        return expiresInMs;
    }

    public void setExpiresInMs(long expiresInMs) {
        this.expiresInMs = expiresInMs;
    }

    public long getRefreshExpiresInMs() {
        return refreshExpiresInMs;
    }

    public void setRefreshExpiresInMs(long refreshExpiresInMs) {
        this.refreshExpiresInMs = refreshExpiresInMs;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
