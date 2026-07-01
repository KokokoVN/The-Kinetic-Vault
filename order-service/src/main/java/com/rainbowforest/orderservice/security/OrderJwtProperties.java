package com.rainbowforest.orderservice.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "jwt")
public class OrderJwtProperties {

    private String secret;
    private Validation validation = new Validation();
    private String publicPaths = "/orders/check,/orders/check/**";

    public static class Validation {
        private boolean enabled = true;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public Validation getValidation() {
        return validation;
    }

    public void setValidation(Validation validation) {
        this.validation = validation;
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
