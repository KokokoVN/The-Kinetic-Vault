package com.rainbowforest.apigateway.filter;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.rainbowforest.apigateway.config.JwtGatewayProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@Component
public class JwtAuthenticationZuulFilter extends ZuulFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationZuulFilter.class);

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Autowired
    private JwtGatewayProperties jwtProperties;

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
        if (!StringUtils.hasText(header) || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return unauthorized(ctx, "Thiếu hoặc sai định dạng Authorization (Bearer token)");
        }
        String token = header.substring(7).trim();
        if (!StringUtils.hasText(token)) {
            return unauthorized(ctx, "Token rỗng");
        }
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(jwtProperties.getSecret())
                    .parseClaimsJws(token)
                    .getBody();
            Object typ = claims.get("typ");
            if (typ != null && "refresh".equalsIgnoreCase(typ.toString())) {
                return unauthorized(ctx, "Refresh token không dùng được cho API này; dùng access token");
            }
            if (typ != null && !"access".equalsIgnoreCase(typ.toString())) {
                return unauthorized(ctx, "Loại token không hợp lệ");
            }
            Object uid = claims.get("uid");
            if (uid != null) {
                ctx.addZuulRequestHeader("X-User-Id", uid.toString());
            }
            String subject = claims.getSubject();
            if (StringUtils.hasText(subject)) {
                ctx.addZuulRequestHeader("X-Username", subject);
            }
            Object role = claims.get("role");
            if (role != null) {
                ctx.addZuulRequestHeader("X-User-Role", role.toString());
            }
        } catch (Exception e) {
            log.debug("JWT không hợp lệ: {}", e.toString());
            return unauthorized(ctx, "Token không hợp lệ hoặc đã hết hạn");
        }
        return null;
    }

    private Object unauthorized(RequestContext ctx, String message) {
        ctx.setSendZuulResponse(false);
        ctx.setResponseStatusCode(401);
        ctx.setRouteHost(null);
        String json = "{\"error\":\"Unauthorized\",\"message\":\"" + escapeJson(message) + "\"}";
        // Dùng RequestContext.setResponseBody — ghi qua HttpServletResponse.getWriter() trong pre-filter
        // dễ gây IllegalStateException và Zuul trả 500 với message "pre:JwtAuthenticationZuulFilter".
        ctx.setResponseBody(json);
        if (ctx.getResponse() != null) {
            ctx.getResponse().setContentType("application/json;charset=UTF-8");
            ctx.getResponse().setCharacterEncoding("UTF-8");
        }
        return null;
    }

    private static String escapeJson(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
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
        // Hỗ trợ cả dạng path có prefix /api và không có /api để tránh lệch cấu hình/môi trường.
        if (safeUri.startsWith("/api/")) {
            return pathMatcher.match(safePattern, safeUri.substring(4));
        }
        if (safeUri.startsWith("/")) {
            return pathMatcher.match(safePattern, "/api" + safeUri);
        }
        return pathMatcher.match(safePattern, "/api/" + safeUri);
    }
}
