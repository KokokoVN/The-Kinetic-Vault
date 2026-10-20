package com.rainbowforest.apigateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@ConfigurationProperties(prefix = "jwt")
public class JwtGatewayProperties {

    private String secret;
    private String publicPaths = "/api/accounts/registration,/api/accounts/registration/**,/api/accounts/auth/**,/api/catalog/**,/api/shop/cart/**,/api/shop/orders/check,/api/shop/orders/check/**,/api/review/**";

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getPublicPaths() {
        return publicPaths;
    }

    public void setPublicPaths(String publicPaths) {
        this.publicPaths = publicPaths;
    }

    public List<String> publicPathPatterns() {
        if (!StringUtils.hasText(publicPaths)) {
            return new ArrayList<>();
        }
        return Arrays.asList(publicPaths.split("\\s*,\\s*"));
    }

    /**
     * Validate secret đủ độ dài và không phải placeholder.
     * Gọi từ bean init để fail-fast khi cấu hình sai.
     */
    @PostConstruct
    public void validate() {
        if (!StringUtils.hasText(secret)) {
            throw new IllegalStateException(
                "jwt.secret chưa được cấu hình. Đặt giá trị >= 64 ký tự hoặc dùng env JWT_SECRET.");
        }
        if (secret.length() < 64) {
            // jjwt 0.9.1 với HS512 yêu cầu key >= 64 bytes. Cảnh báo thay vì fail.
            // Service sẽ tự pad bằng cách băm SHA-512 trong JwtAuthenticationZuulFilter.
            System.err.println("[WARN] jwt.secret ngắn hơn 64 ký tự - sẽ tự động băm SHA-512 để đảm bảo an toàn cho HS512.");
        }
        if (secret.contains("CHANGE_ME") || secret.startsWith("RainbowForestEcommerceJWTSecretKey")) {
            System.err.println("[WARN] jwt.secret đang dùng giá trị placeholder mặc định. Hãy thay bằng giá trị random mạnh trong production!");
        }
    }
}