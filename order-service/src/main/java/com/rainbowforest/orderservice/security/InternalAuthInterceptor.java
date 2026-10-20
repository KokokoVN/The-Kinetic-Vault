package com.rainbowforest.orderservice.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Interceptor xác thực Server-to-Server (Item 6):
 * Kiểm tra header X-Internal-Secret cho các API nội bộ / internal endpoints.
 */
@Component
public class InternalAuthInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(InternalAuthInterceptor.class);

    @Value("${internal.service.secret:TQjHHfANqChwqKF4nQ0im06mCAhbscepCwvzYUMz/b5CmXiUULFl2NZxOx8HZcfK}")
    private String expectedSecret;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        if (uri.startsWith("/internal/")) {
            String secretHeader = request.getHeader("X-Internal-Secret");
            if (secretHeader == null || !secretHeader.equals(expectedSecret)) {
                log.warn("[InternalAuth] Request bị chặn do thiếu hoặc sai X-Internal-Secret header tại URI: {}", uri);
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid internal secret token.\",\"status\":401}");
                return false;
            }
        }
        return true;
    }
}
