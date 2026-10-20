package com.rainbowforest.paymentservice.config;

import com.rainbowforest.paymentservice.security.InternalAuthInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig implements WebMvcConfigurer {

    private final InternalAuthInterceptor internalAuthInterceptor;

    @Autowired
    public SecurityConfig(InternalAuthInterceptor internalAuthInterceptor) {
        this.internalAuthInterceptor = internalAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Áp dụng InternalAuthInterceptor cho tất cả endpoints (cả /create, /{id}/complete...).
        // Server-to-server requests phải truyền X-Internal-Secret hợp lệ.
        registry.addInterceptor(internalAuthInterceptor);
    }
}