package com.rainbowforest.apigateway.config;

import com.rainbowforest.apigateway.filter.SessionFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class ApiConfig {

    @Value("${app.security.cors.allowed-origins:http://localhost:3000,http://localhost:3001}")
    private String corsAllowedOrigins;

    @Bean
    public SessionFilter sessionFilter(){
        return new SessionFilter();
    }

    /**
     * CORS filter với whitelist origins (cấu hình qua env).
     * Production: chỉ định domain chính thức, không dùng "*".
     */
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        List<String> origins = Arrays.stream(corsAllowedOrigins.split("\\s*,\\s*"))
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        // allowCredentials chỉ hoạt động với origin cụ thể (không dùng "*").
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "Accept", "Origin",
                "X-Requested-With", "X-Internal-Secret", "X-User-Id",
                "Idempotency-Key", "Cookie", "X-User-Role"));
        config.setExposedHeaders(Arrays.asList("Retry-After", "X-Total-Count"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}