package com.rainbowforest.apigateway.filter;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Zuul Pre-Filter: Chặn Bot, Crawlers độc hại và Vulnerability Scanners (Item 13).
 */
@Component
public class BotProtectionZuulFilter extends ZuulFilter {

    private static final Logger log = LoggerFactory.getLogger(BotProtectionZuulFilter.class);

    // Danh sách User-Agent độc hại / scanners thường gặp
    private static final List<String> BLOCKED_USER_AGENTS = Arrays.asList(
            "nikto", "nmap", "sqlmap", "dirbuster", "masscan", "zgrab", "w3af",
            "acunetix", "nessus", "netsparker", "gobuster", "hydra", "metasploit",
            "python-requests/0.", "libwww-perl"
    );

    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        // Chạy ngay đầu tiên (Order -1)
        return -1;
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();
        String userAgent = request.getHeader("User-Agent");

        if (userAgent == null || userAgent.trim().isEmpty()) {
            // Chặn request không có User-Agent đối với các API POST/PUT/DELETE
            String method = request.getMethod();
            if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method)) {
                log.warn("[BotProtection] Chặn request không có User-Agent từ IP: {}", request.getRemoteAddr());
                blockRequest(ctx, "Thiếu User-Agent header hợp lệ.");
                return null;
            }
        } else {
            String lowerUserAgent = userAgent.toLowerCase(Locale.ROOT);
            for (String blockedAgent : BLOCKED_USER_AGENTS) {
                if (lowerUserAgent.contains(blockedAgent)) {
                    log.warn("[BotProtection] Chặn Scanner/Bot: {} từ IP: {}", userAgent, request.getRemoteAddr());
                    blockRequest(ctx, "Truy cập bị từ chối do hệ thống phát hiện bot / scanner độc hại.");
                    return null;
                }
            }
        }

        return null;
    }

    private void blockRequest(RequestContext ctx, String message) {
        ctx.setSendZuulResponse(false);
        ctx.setResponseStatusCode(HttpStatus.FORBIDDEN.value());
        ctx.setResponseBody("{\"error\":\"Forbidden\",\"message\":\"" + message + "\",\"status\":403}");
        ctx.getResponse().setContentType("application/json;charset=UTF-8");
    }
}
