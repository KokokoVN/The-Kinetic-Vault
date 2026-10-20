package com.rainbowforest.paymentservice.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Interceptor xác thực Server-to-Server:
 * - Endpoint /internal/**  - Yêu cầu X-Internal-Secret hợp lệ (server-to-server).
 * - Endpoint khác (/{id}, /create, ...) - Yêu cầu JWT hợp lệ (gateway đã verify).
 *
 * Lưu ý: Hầu hết requests đến payment-service đều từ order-service qua gateway
 * với X-Internal-Secret. Nếu request đến từ user (có JWT), gateway đã xác thực
 * và set X-User-Id, X-User-Role. Các endpoint lấy payment phải check ownership.
 */
@Component
public class InternalAuthInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(InternalAuthInterceptor.class);

    @Value("${internal.service.secret:}")
    private String expectedSecret;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        String method = request.getMethod();

        // Cho phép preflight CORS.
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        // Endpoint /internal/** và các endpoint nhạy cảm (complete, fail, reconcile-paid, create) phải có X-Internal-Secret.
        boolean isProtected = uri.startsWith("/internal/")
                || uri.endsWith("/complete")
                || uri.endsWith("/fail")
                || uri.contains("/reconcile-paid")
                || uri.equals("/create")
                || uri.startsWith("/create/");

        if (isProtected) {
            String secretHeader = request.getHeader("X-Internal-Secret");
            // Chỉ chấp nhận secret khớp (constant-time comparison để chống timing attack).
            if (expectedSecret == null || expectedSecret.trim().isEmpty()) {
                log.error("[InternalAuth] internal.service.secret chưa được cấu hình - chặn mọi protected payment call");
                sendUnauthorized(response);
                return false;
            }
            if (secretHeader == null || !constantTimeEquals(secretHeader, expectedSecret)) {
                log.warn("[InternalAuth] Request bị chặn do thiếu hoặc sai X-Internal-Secret header tại URI: {}", uri);
                sendUnauthorized(response);
                return false;
            }
        }
        return true;
    }

    private void sendUnauthorized(HttpServletResponse response) throws Exception {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid internal secret token.\",\"status\":401}");
    }

    /**
     * Constant-time string comparison để chống timing attack.
     */
    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        byte[] ab = a.getBytes();
        byte[] bb = b.getBytes();
        if (ab.length != bb.length) return false;
        int diff = 0;
        for (int i = 0; i < ab.length; i++) {
            diff |= ab[i] ^ bb[i];
        }
        return diff == 0;
    }
}