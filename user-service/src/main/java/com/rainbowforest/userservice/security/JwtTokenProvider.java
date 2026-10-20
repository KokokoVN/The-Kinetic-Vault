package com.rainbowforest.userservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

/**
 * Cung cấp và xác thực JWT token (access + refresh).
 *
 * <p>Cải tiến bảo mật:
 * <ul>
 *   <li>Key được pad bằng SHA-512 nếu &lt; 64 bytes (HS512 yêu cầu tối thiểu 64 bytes).</li>
 *   <li>Mặc định access token 15 phút, refresh 7 ngày.</li>
 *   <li>Phân biệt access vs refresh qua claim "typ".</li>
 * </ul>
 */
@Component
public class JwtTokenProvider {

    public static final String CLAIM_TYPE = "typ";
    public static final String TYPE_ACCESS = "access";
    public static final String TYPE_REFRESH = "refresh";

    @Value("${jwt.secret:}")
    private String secret;

    @Value("${jwt.expiration-ms:900000}")
    private long expirationMs;

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    private String effectiveKey;

    @PostConstruct
    public void init() {
        if (secret == null || secret.isEmpty()) {
            throw new IllegalStateException(
                "jwt.secret chưa được cấu hình. Đặt giá trị >= 64 ký tự qua env JWT_SECRET.");
        }
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 64) {
            try {
                keyBytes = MessageDigest.getInstance("SHA-512").digest(keyBytes);
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalStateException("SHA-512 not available", e);
            }
        }
        this.effectiveKey = new String(keyBytes, StandardCharsets.UTF_8);
    }

    public String createAccessToken(Long userId, String username, String roleName) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .setSubject(username)
                .claim("uid", userId)
                .claim("role", roleName != null ? roleName : "ROLE_USER")
                .claim(CLAIM_TYPE, TYPE_ACCESS)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(SignatureAlgorithm.HS512, effectiveKey)
                .compact();
    }

    public String createRefreshToken(Long userId, String username) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + refreshExpirationMs);
        return Jwts.builder()
                .setSubject(username)
                .claim("uid", userId)
                .claim(CLAIM_TYPE, TYPE_REFRESH)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(SignatureAlgorithm.HS512, effectiveKey)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .setSigningKey(effectiveKey)
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Parse token an toàn - trả về null khi token không hợp lệ.
     */
    public Claims parseClaimsQuietly(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }
        try {
            return parseClaims(token);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    public boolean isRefreshToken(Claims claims) {
        return claims != null && TYPE_REFRESH.equals(claims.get(CLAIM_TYPE));
    }

    public boolean isAccessToken(Claims claims) {
        if (claims == null) return false;
        Object t = claims.get(CLAIM_TYPE);
        return t != null && TYPE_ACCESS.equals(String.valueOf(t));
    }

    public long getAccessExpirationMs() {
        return expirationMs;
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }
}