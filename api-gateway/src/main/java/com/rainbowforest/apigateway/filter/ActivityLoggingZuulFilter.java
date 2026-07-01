package com.rainbowforest.apigateway.filter;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.rainbowforest.apigateway.client.ActivityLogClient;
import com.rainbowforest.apigateway.client.dto.WebActivityLogRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.util.concurrent.CompletableFuture;

@Component
public class ActivityLoggingZuulFilter extends ZuulFilter {

    private static final Logger log = LoggerFactory.getLogger(ActivityLoggingZuulFilter.class);

    @Value("${activity.logging.enabled:true}")
    private boolean activityLoggingEnabled;

    @Autowired(required = false)
    private ActivityLogClient activityLogClient;

    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        return 2;
    }

    @Override
    public boolean shouldFilter() {
        if (!activityLoggingEnabled || activityLogClient == null) {
            return false;
        }
        RequestContext ctx = RequestContext.getCurrentContext();
        if (ctx == null) {
            return false;
        }
        HttpServletRequest req = ctx.getRequest();
        if (req == null) {
            return false;
        }
        String method = req.getMethod();
        if (method != null && "GET".equalsIgnoreCase(method)) {
            return false;
        }
        String uri = req.getRequestURI();
        if (uri == null) {
            return true;
        }
        String lower = uri.toLowerCase();
        if (lower.contains("/activity/") || lower.contains("/actuator")) {
            return false;
        }
        return true;
    }

    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest req = ctx.getRequest();
        WebActivityLogRequest body = new WebActivityLogRequest();
        body.setAction("GATEWAY_REQUEST");
        body.setHttpMethod(req.getMethod());
        body.setRequestPath(req.getRequestURI());
        String qs = req.getQueryString();
        if (qs != null && !qs.isEmpty()) {
            body.setDetailJson("{\"query\":\"" + escapeJson(qs) + "\"}");
        }
        body.setIpAddress(clientIp(req));
        body.setUserAgent(trimHeader(req.getHeader("User-Agent"), 500));
        String userId = req.getHeader("X-User-Id");
        String username = req.getHeader("X-Username");
        body.setActorUserId(trimHeader(userId, 64));
        body.setActorUsername(trimHeader(username, 128));
        body.setPerformedBy(username != null ? username : userId);

        CompletableFuture.runAsync(() -> {
            try {
                activityLogClient.log(body);
            } catch (Exception e) {
                log.debug("Không ghi được activity log: {}", e.toString());
            }
        });
        return null;
    }

    private static String trimHeader(String v, int max) {
        if (v == null) {
            return null;
        }
        return v.length() <= max ? v : v.substring(0, max);
    }

    private static String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private static String clientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            int comma = xff.indexOf(',');
            return comma > 0 ? xff.substring(0, comma).trim() : xff.trim();
        }
        return req.getRemoteAddr();
    }
}
