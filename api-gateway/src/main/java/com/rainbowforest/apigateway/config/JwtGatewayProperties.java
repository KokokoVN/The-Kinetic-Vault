package com.rainbowforest.apigateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

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
}
