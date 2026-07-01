package com.rainbowforest.reviewservice.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

@Configuration
public class FeignAuthForwardConfig {

    @Bean
    public RequestInterceptor forwardAuthorizationHeaderInterceptor() {
        return template -> {
            RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
            if (!(attributes instanceof ServletRequestAttributes)) {
                return;
            }

            HttpServletRequest request = ((ServletRequestAttributes) attributes).getRequest();
            if (request == null) {
                return;
            }

            String authorization = request.getHeader("Authorization");
            if (StringUtils.hasText(authorization)) {
                template.header("Authorization", authorization);
            }
        };
    }
}
