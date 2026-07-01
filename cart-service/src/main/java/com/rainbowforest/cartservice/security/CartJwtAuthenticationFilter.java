package com.rainbowforest.cartservice.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CartJwtAuthenticationFilter extends OncePerRequestFilter {

    private final CartJwtProperties properties;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CartJwtAuthenticationFilter(CartJwtProperties properties) {
        this.properties = properties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!properties.getValidation().isEnabled()) {
            return true;
        }
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = normalizedPath(request);
        for (String pattern : properties.publicPathPatterns()) {
            if (pathMatcher.match(pattern.trim(), path)) {
                return true;
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!StringUtils.hasText(properties.getSecret())) {
            writeJson(response, HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "Cấu hình JWT thiếu jwt.secret");
            return;
        }

        String header = request.getHeader("Authorization");
        if (!StringUtils.hasText(header) || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            writeJson(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Thiếu hoặc sai định dạng Authorization (Bearer access token)");
            return;
        }
        String token = header.substring(7).trim();
        if (!StringUtils.hasText(token)) {
            writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, "Token rỗng");
            return;
        }

        final Map<String, Object> claims;
        try {
            claims = parseAndValidateJwt(token, properties.getSecret());
        } catch (Exception e) {
            writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, "Token không hợp lệ hoặc đã hết hạn");
            return;
        }

        Object typ = claims.get("typ");
        if (typ != null && "refresh".equalsIgnoreCase(typ.toString())) {
            writeJson(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Cần access token, không dùng refresh token cho endpoint này");
            return;
        }
        if (typ != null && !"access".equalsIgnoreCase(typ.toString())) {
            writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, "Loại token không hợp lệ");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Map<String, Object> parseAndValidateJwt(String token, String secret) throws Exception {
        Claims claims = Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
        return objectMapper.convertValue(claims, new TypeReference<Map<String, Object>>() {});
    }

    private static String normalizedPath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String ctx = request.getContextPath();
        if (ctx != null && !ctx.isEmpty() && uri.startsWith(ctx)) {
            uri = uri.substring(ctx.length());
        }
        if (uri.isEmpty()) {
            return "/";
        }
        return uri;
    }

    private static void writeJson(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String body = "{\"error\":\"" + (status == 503 ? "Service Unavailable" : "Unauthorized")
                + "\",\"message\":\"" + escapeJson(message) + "\"}";
        response.getOutputStream().write(body.getBytes(StandardCharsets.UTF_8));
    }

    private static String escapeJson(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
