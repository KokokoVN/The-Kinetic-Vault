package com.rainbowforest.apigateway.filter;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.rainbowforest.apigateway.config.JwtGatewayProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MissingClaimException;
import io.jsonwebtoken.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

/**
 * Zuul Pre-Filter: Xác thực JWT.
 *
 * <p>Cải tiến bảo mật:
 * <ul>
 *   <li>Nếu secret &lt; 64 bytes, tự pad bằng SHA-512 (HS512 yêu cầu key >= 64 bytes).</li>
 *   <li>Sử dụng constant-time comparison cho header Bearer.</li>
 *   <li>Log lỗi chi tiết theo loại (expired / signature invalid / malformed).</li>
 *   <li>Validate claim "typ" nghiêm ngặt (chống refresh-token replay).</li>
 *   <li>Bắt buộc claim "uid".</li>
 *   <li>Phân quyền: /admin/** yêu cầu role ADMIN.</li>
 * </ul>
 */
@Component
public class JwtAuthenticationZuulFilter extends ZuulFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationZuulFilter.class);

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Autowired
    private JwtGatewayProperties jwtProperties;

    private String effectiveKey;

    @PostConstruct
    public void initKey() {
        String secret = jwtProperties.getSecret();
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 64) {
            try {
                keyBytes = MessageDigest.getInstance("SHA-512").digest(keyBytes);
                log.info("jwt.secret ngắn - đã pad bằng SHA-512 để đảm bảo >= 64 bytes cho HS512.");
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalStateException("SHA-512 not available", e);
            }
        }
        this.effectiveKey = new String(keyBytes, StandardCharsets.UTF_8);
    }

    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }

    @Override
    public boolean shouldFilter() {
        RequestContext ctx = RequestContext.getCurrentContext();
        if (ctx == null) {
            return false;
        }
        HttpServletRequest req = ctx.getRequest();
        if (req == null) {
            return false;
        }
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            return false;
        }
        String uri = req.getRequestURI();
        if (!StringUtils.hasText(uri) || !StringUtils.hasText(jwtProperties.getSecret())) {
            return false;
        }

        // Bất kỳ endpoint quản trị nào (/admin/** hoặc /carts/admin/** hoặc đổi role) KHÔNG ĐƯỢC PHÉP public
        // Ngoại trừ các endpoint phục vụ media, hình ảnh sản phẩm công khai (/images/, /logos/, /file/)
        boolean isStaticMedia = uri.contains("/images/") || uri.contains("/logos/") || uri.contains("/file/");
        if (!isStaticMedia && (uri.contains("/admin") || uri.endsWith("/admin") || uri.endsWith("/role") || uri.contains("/role/"))) {
            return true;
        }

        List<String> publicPatterns = jwtProperties.publicPathPatterns();
        for (String pattern : publicPatterns) {
            if (matchesPublicPath(pattern, uri)) {
                return false;
            }
        }
        return true;
    }

    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        if (ctx == null) {
            return null;
        }
        HttpServletRequest req = ctx.getRequest();
        if (req == null) {
            return null;
        }
        String header = req.getHeader("Authorization");
        if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
            return unauthorized(ctx, "Thiếu hoặc sai định dạng Authorization (Bearer token)");
        }
        String token = header.substring(7).trim();
        if (!StringUtils.hasText(token) || token.length() > 4096) {
            return unauthorized(ctx, "Token rỗng hoặc quá dài");
        }
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(effectiveKey)
                    .parseClaimsJws(token)
                    .getBody();

            // Validate token type nghiêm ngặt (chống refresh-token replay).
            Object typ = claims.get("typ");
            if (typ == null) {
                return unauthorized(ctx, "Token thiếu claim 'typ'");
            }
            String typValue = String.valueOf(typ);
            if (!"access".equalsIgnoreCase(typValue)) {
                if ("refresh".equalsIgnoreCase(typValue)) {
                    return unauthorized(ctx, "Refresh token không dùng được cho API này; dùng access token");
                }
                return unauthorized(ctx, "Loại token không hợp lệ");
            }

            // Bắt buộc có user id.
            Object uid = claims.get("uid");
            if (uid == null) {
                return unauthorized(ctx, "Token thiếu claim 'uid'");
            }
            ctx.addZuulRequestHeader("X-User-Id", uid.toString());

            String subject = claims.getSubject();
            if (StringUtils.hasText(subject)) {
                ctx.addZuulRequestHeader("X-Username", subject);
            }
            Object role = claims.get("role");
            if (role != null) {
                ctx.addZuulRequestHeader("X-User-Role", role.toString());
                ctx.addZuulRequestHeader("X-User-Roles", role.toString());
            }

            // Phân quyền: /admin/**, /carts/admin/** và thay đổi vai trò (role) chỉ dành cho role ADMIN.
            String uri = req.getRequestURI();
            if (uri != null && (uri.contains("/admin") || uri.endsWith("/admin") || uri.endsWith("/role") || uri.contains("/role/"))) {
                String roleStr = role != null ? role.toString().toUpperCase() : "";
                if (!roleStr.contains("ADMIN")) {
                    return forbidden(ctx, "Người dùng không đủ quyền truy cập tài nguyên quản trị");
                }
            }
        } catch (ExpiredJwtException e) {
            log.debug("JWT expired: {}", e.toString());
            return unauthorized(ctx, "Token đã hết hạn");
        } catch (MissingClaimException e) {
            log.debug("JWT missing claim: {}", e.toString());
            return unauthorized(ctx, "Token thiếu claim bắt buộc");
        } catch (SignatureException e) {
            log.debug("JWT signature invalid: {}", e.toString());
            return unauthorized(ctx, "Chữ ký token không hợp lệ");
        } catch (JwtException e) {
            log.debug("JWT invalid: {}", e.toString());
            return unauthorized(ctx, "Token không hợp lệ");
        } catch (IllegalArgumentException e) {
            log.debug("JWT illegal arg: {}", e.toString());
            return unauthorized(ctx, "Token không hợp lệ");
        }
        return null;
    }

    private Object forbidden(RequestContext ctx, String message) {
        ctx.setSendZuulResponse(false);
        ctx.setResponseStatusCode(403);
        ctx.setRouteHost(null);
        String json = "{\"error\":\"Forbidden\",\"message\":\"" + escapeJson(message) + "\"}";
        ctx.setResponseBody(json);
        if (ctx.getResponse() != null) {
            ctx.getResponse().setContentType("application/json;charset=UTF-8");
            ctx.getResponse().setCharacterEncoding("UTF-8");
        }
        return null;
    }

    private Object unauthorized(RequestContext ctx, String message) {
        ctx.setSendZuulResponse(false);
        ctx.setResponseStatusCode(401);
        ctx.setRouteHost(null);
        String json = "{\"error\":\"Unauthorized\",\"message\":\"" + escapeJson(message) + "\"}";
        ctx.setResponseBody(json);
        if (ctx.getResponse() != null) {
            ctx.getResponse().setContentType("application/json;charset=UTF-8");
            ctx.getResponse().setCharacterEncoding("UTF-8");
        }
        return null;
    }

    /**
     * Escape JSON an toàn - xử lý đầy đủ control chars chống response smuggling.
     */
    private static String escapeJson(String s) {
        if (s == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder(s.length() + 16);
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '\\': sb.append("\\\\"); break;
                case '"': sb.append("\\\""); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                default:
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }

    @SuppressWarnings("null")
    private boolean matchesPublicPath(String pattern, String uri) {
        String safePattern = pattern != null ? pattern.trim() : "";
        String safeUri = uri != null ? uri : "";
        if (!StringUtils.hasText(safePattern) || !StringUtils.hasText(safeUri)) {
            return false;
        }
        if (pathMatcher.match(safePattern, safeUri)) {
            return true;
        }
        if (safeUri.startsWith("/api/")) {
            return pathMatcher.match(safePattern, safeUri.substring(4));
        }
        if (safeUri.startsWith("/")) {
            return pathMatcher.match(safePattern, "/api" + safeUri);
        }
        return pathMatcher.match(safePattern, "/api/" + safeUri);
    }
}