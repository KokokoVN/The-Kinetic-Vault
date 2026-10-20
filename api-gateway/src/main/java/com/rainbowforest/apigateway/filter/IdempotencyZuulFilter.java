package com.rainbowforest.apigateway.filter;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Filter Idempotency Chống Trùng Lặp (Double Submit Protection) cho API Gateway.
 *
 * <p>Cải tiến so với phiên bản cũ:
 * <ul>
 *   <li>Dùng LinkedHashMap LRU (max 5000 entry) thay vì ConcurrentHashMap vô hạn → tránh memory leak.</li>
 *   <li>Cleanup tự động định kỳ.</li>
 *   <li>Giới hạn kích thước Idempotency-Key (256 chars) để chống DoS.</li>
 * </ul>
 */
@Component
public class IdempotencyZuulFilter extends ZuulFilter {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyZuulFilter.class);
    private static final int MAX_CACHE_SIZE = 5000;
    private static final int MAX_KEY_LENGTH = 256;

    private static class CacheEntry {
        final long createdAt = System.currentTimeMillis();
        final long ttlMs;
        volatile boolean inProgress = true;
        volatile int statusCode = 200;
        volatile String responseBody = "";

        CacheEntry(long ttlMs) {
            this.ttlMs = ttlMs;
        }

        boolean isExpired() {
            return System.currentTimeMillis() - createdAt > ttlMs;
        }
    }

    /** LRU cache với size limit + auto-cleanup entry hết hạn. */
    private final Map<String, CacheEntry> idempotencyCache = Collections.synchronizedMap(
            new LinkedHashMap<String, CacheEntry>(MAX_CACHE_SIZE / 2, 0.75f, true) {
                @Override
                protected boolean removeEldestEntry(Map.Entry<String, CacheEntry> eldest) {
                    // Xoá luôn nếu hết hạn, hoặc khi vượt size.
                    return size() > MAX_CACHE_SIZE || (eldest != null && eldest.getValue() != null && eldest.getValue().isExpired());
                }
            });

    private volatile long lastCleanupNanos = System.nanoTime();

    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 2;
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
        String method = req.getMethod();
        if (!"POST".equalsIgnoreCase(method) && !"PUT".equalsIgnoreCase(method)) {
            return false;
        }
        String uri = req.getRequestURI();
        if (!StringUtils.hasText(uri)) {
            return false;
        }
        return uri.contains("/cart") || uri.contains("/orders") || uri.contains("/payments");
    }

    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest req = ctx.getRequest();
        String idempotencyKey = req.getHeader("Idempotency-Key");

        maybeCleanup();

        if (!StringUtils.hasText(idempotencyKey)) {
            // Tự sinh key nếu client không cung cấp.
            idempotencyKey = UUID.randomUUID().toString();
            ctx.addZuulRequestHeader("Idempotency-Key", idempotencyKey);
            return null;
        }

        // Giới hạn độ dài key để chống DoS / memory attack.
        if (idempotencyKey.length() > MAX_KEY_LENGTH) {
            idempotencyKey = idempotencyKey.substring(0, MAX_KEY_LENGTH);
        }

        String uri = req.getRequestURI();
        long ttlMs = uri != null && uri.contains("/cart") ? 60_000L : 15 * 60_000L;

        CacheEntry newEntry = new CacheEntry(ttlMs);
        CacheEntry existing = idempotencyCache.putIfAbsent(idempotencyKey, newEntry);

        if (existing != null && !existing.isExpired()) {
            if (existing.inProgress) {
                log.warn("Phát hiện đúp giao dịch đang xử lý với Idempotency-Key: {}", idempotencyKey);
                ctx.setSendZuulResponse(false);
                ctx.setResponseStatusCode(409);
                ctx.setResponseBody("{\"error\":\"409 Conflict\",\"message\":\"Giao dịch đang được xử lý, vui lòng không nhấn liên tục\"}");
                if (ctx.getResponse() != null) {
                    ctx.getResponse().setContentType("application/json;charset=UTF-8");
                }
                return null;
            } else {
                log.info("Trả về kết quả cache cho Idempotency-Key trùng lặp: {}", idempotencyKey);
                ctx.setSendZuulResponse(false);
                ctx.setResponseStatusCode(existing.statusCode);
                ctx.setResponseBody(existing.responseBody);
                if (ctx.getResponse() != null) {
                    ctx.getResponse().setContentType("application/json;charset=UTF-8");
                }
                return null;
            }
        }

        ctx.addZuulRequestHeader("Idempotency-Key", idempotencyKey);
        return null;
    }

    private void maybeCleanup() {
        long currentNanos = System.nanoTime();
        if (currentNanos - lastCleanupNanos > TimeUnit.MINUTES.toNanos(2)) {
            lastCleanupNanos = currentNanos;
            synchronized (idempotencyCache) {
                // LRU sẽ tự loại entry cũ; chỉ cần xoá các entry đã hết hạn còn sót.
                idempotencyCache.entrySet().removeIf(e -> {
                    CacheEntry v = e.getValue();
                    return v == null || v.isExpired();
                });
            }
        }
    }
}