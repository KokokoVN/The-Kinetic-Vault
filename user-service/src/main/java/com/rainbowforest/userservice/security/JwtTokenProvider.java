package com.rainbowforest.userservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenProvider {

    public static final String CLAIM_TYPE = "typ";
    public static final String TYPE_ACCESS = "access";
    public static final String TYPE_REFRESH = "refresh";

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms:900000}")
    private long expirationMs;

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

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
                .signWith(SignatureAlgorithm.HS512, secret)
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
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
    }

    public boolean isRefreshToken(Claims claims) {
        return TYPE_REFRESH.equals(claims.get(CLAIM_TYPE));
    }

    public boolean isAccessToken(Claims claims) {
        Object t = claims.get(CLAIM_TYPE);
        return t == null || TYPE_ACCESS.equals(String.valueOf(t));
    }

    public long getAccessExpirationMs() {
        return expirationMs;
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }
}
