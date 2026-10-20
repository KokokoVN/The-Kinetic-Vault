package com.rainbowforest.apigateway.filter;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.netflix.zuul.exception.ZuulException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.Refill;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Zuul Pre-Filter: Multi-Tier Token Bucket Rate Limiting dùng Bucket4j + LRU cache.
 *
 * <p>Kiến trúc phân tầng bảo vệ (Multi-tier Protection):
 * <ul>
 *   <li><b>Tier 1 - Auth / OTP</b>: Giới hạn nghiêm ngặt chống Brute-Force & Credential Stuffing (mặc định 15 req/phút).</li>
 *   <li><b>Tier 2 - Checkout & Payment</b>: Bảo vệ giao dịch thanh toán và đơn hàng chống spam / duplicate (mặc định 30 req/phút).</li>
 *   <li><b>Tier 3 - Authenticated User</b>: Theo ID người dùng (user:uid), bảo vệ công bằng giữa các tài khoản (mặc định 300 req/phút).</li>
 *   <li><b>Tier 4 - Admin</b>: Hạn mức cao (1000 req/phút) phục vụ các tác vụ quản trị, giám sát và import.</li>
 *   <li><b>Tier 5 - General Public</b>: Theo IP khách vãng lai duyệt danh mục sản phẩm (mặc định 150 req/phút).</li>
 * </ul>
 *
 * <p>Tính năng bổ sung:
 * <ul>
 *   <li>Trả về chuẩn headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After.</li>
 *   <li>Bypass cho Service-to-Service qua X-Internal-Secret.</li>
 *   <li>Tùy chọn bypass môi trường dev nội bộ qua rate-limit.local-bypass.</li>
 *   <li>Trích xuất IP chuẩn qua CF-Connecting-IP, X-Real-IP, X-Forwarded-For.</li>
 *   <li>Bộ nhớ LRU tự động dọn dẹp chống memory leak.</li>
 * </ul>
 */
@Component
public class RateLimitZuulFilter extends ZuulFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitZuulFilter.class);
    private static final int MAX_BUCKETS_PER_TIER = 15_000;

    @Value("${rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${rate-limit.local-bypass:false}")
    private boolean localBypass;

    @Value("${rate-limit.general.requests-per-minute:150}")
    private int generalRequestsPerMinute;

    @Value("${rate-limit.auth.requests-per-minute:15}")
    private int authRequestsPerMinute;

    @Value("${rate-limit.checkout.requests-per-minute:30}")
    private int checkoutRequestsPerMinute;

    @Value("${rate-limit.user.requests-per-minute:300}")
    private int userRequestsPerMinute;

    @Value("${rate-limit.admin.requests-per-minute:1000}")
    private int adminRequestsPerMinute;

    @Value("${internal.service.secret:}")
    private String internalSecret;

    // LRU caches cho từng tier
    private final Map<String, Bucket> authBucketCache = createLruCache();
    private final Map<String, Bucket> checkoutBucketCache = createLruCache();
    private final Map<String, Bucket> userBucketCache = createLruCache();
    private final Map<String, Bucket> adminBucketCache = createLruCache();
    private final Map<String, Bucket> generalBucketCache = createLruCache();

    private volatile long lastCleanupNanos = System.nanoTime();

    private static Map<String, Bucket> createLruCache() {
        return Collections.synchronizedMap(
                new LinkedHashMap<String, Bucket>(MAX_BUCKETS_PER_TIER / 2, 0.75f, true) {
                    @Override
                    protected boolean removeEldestEntry(Map.Entry<String, Bucket> eldest) {
                        return size() > MAX_BUCKETS_PER_TIER;
                    }
                });
    }

    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        // Chạy sau JwtAuthenticationZuulFilter (order < 0) để có thông tin X-User-Id và X-User-Role
        return 5;
    }

    @Override
    public boolean shouldFilter() {
        return rateLimitEnabled;
    }

    @Override
    public Object run() throws ZuulException {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();

        // 1. Bypass cho request nội bộ có internal secret hợp lệ
        String requestSecret = request.getHeader("X-Internal-Secret");
        if (internalSecret != null && !internalSecret.isEmpty()
                && requestSecret != null && constantTimeEquals(requestSecret, internalSecret)) {
            return null;
        }

        // 2. Trích xuất Client IP
        String clientIp = extractClientIp(request);

        // 3. Tùy chọn bypass localhost trong môi trường dev nếu bật
        if (localBypass && isPrivateOrLocalIp(clientIp)) {
            return null;
        }

        maybeCleanup();

        String uri = request.getRequestURI() != null ? request.getRequestURI().toLowerCase() : "";
        Map<String, String> zuulHeaders = ctx.getZuulRequestHeaders();
        String userId = getHeaderCaseInsensitive(zuulHeaders, "x-user-id");
        String userRole = getHeaderCaseInsensitive(zuulHeaders, "x-user-role");
        boolean isAdmin = userRole != null && userRole.toUpperCase().contains("ADMIN");

        // 4. Phân loại Tier và áp dụng Rate Limiting phù hợp
        String tierName;
        int limitPerMinute;
        String cacheKey;
        Bucket bucket;

        if (isAdmin) {
            // ADMIN TIER
            tierName = "ADMIN";
            limitPerMinute = adminRequestsPerMinute;
            cacheKey = "admin:" + (userId != null ? userId : clientIp);
            bucket = adminBucketCache.computeIfAbsent(cacheKey, k -> createBucket(limitPerMinute));
        } else if (isAuthEndpoint(uri)) {
            // AUTH TIER (Brute-force protection)
            tierName = "AUTH";
            limitPerMinute = authRequestsPerMinute;
            cacheKey = "auth:" + clientIp;
            bucket = authBucketCache.computeIfAbsent(cacheKey, k -> createBucket(limitPerMinute));
        } else if (isCheckoutEndpoint(uri)) {
            // CHECKOUT & PAYMENT TIER
            tierName = "CHECKOUT";
            limitPerMinute = checkoutRequestsPerMinute;
            cacheKey = "checkout:" + (userId != null ? userId : clientIp);
            bucket = checkoutBucketCache.computeIfAbsent(cacheKey, k -> createBucket(limitPerMinute));
        } else if (userId != null && !userId.isEmpty()) {
            // AUTHENTICATED USER TIER
            tierName = "USER";
            limitPerMinute = userRequestsPerMinute;
            cacheKey = "user:" + userId;
            bucket = userBucketCache.computeIfAbsent(cacheKey, k -> createBucket(limitPerMinute));
        } else {
            // GENERAL ANONYMOUS PUBLIC TIER
            tierName = "GENERAL";
            limitPerMinute = generalRequestsPerMinute;
            cacheKey = "gen:" + clientIp;
            bucket = generalBucketCache.computeIfAbsent(cacheKey, k -> createBucket(limitPerMinute));
        }

        // 5. Kiểm tra Token Bucket
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            // Cho phép request tiếp tục, bổ sung headers thông báo hạn mức
            long remaining = probe.getRemainingTokens();
            ctx.addZuulResponseHeader("X-RateLimit-Limit", String.valueOf(limitPerMinute));
            ctx.addZuulResponseHeader("X-RateLimit-Remaining", String.valueOf(remaining));
            return null;
        } else {
            // Vượt quá hạn mức -> Chặn với HTTP 429 Too Many Requests
            long waitNanos = probe.getNanosToWaitForRefill();
            long retryAfterSec = Math.max(1, TimeUnit.NANOSECONDS.toSeconds(waitNanos));

            log.warn("[RateLimit-{}] Khóa truy cập cho '{}' (hạn mức {} req/phút). Thử lại sau {} giây. URI: {}",
                    tierName, cacheKey, limitPerMinute, retryAfterSec, uri);

            String message;
            if ("AUTH".equals(tierName)) {
                message = "Bạn đã thực hiện thao tác xác thực quá " + limitPerMinute + " lần/phút. Vui lòng đợi " + retryAfterSec + " giây trước khi thử lại.";
            } else if ("CHECKOUT".equals(tierName)) {
                message = "Hệ thống đang bảo vệ giao dịch của bạn. Vui lòng đợi " + retryAfterSec + " giây trước khi thực hiện thanh toán tiếp theo.";
            } else {
                message = "Bạn đã gửi quá nhiều yêu cầu (" + limitPerMinute + " req/phút). Vui lòng thử lại sau " + retryAfterSec + " giây.";
            }

            return block(ctx, HttpStatus.TOO_MANY_REQUESTS, message, "Too Many Requests", tierName, limitPerMinute, retryAfterSec);
        }
    }

    private boolean isAuthEndpoint(String uri) {
        return uri.contains("/login")
                || uri.contains("/registration")
                || uri.contains("/auth/")
                || uri.contains("/otp")
                || uri.contains("/verify")
                || uri.contains("/forgot-password")
                || uri.contains("/reset-password");
    }

    private boolean isCheckoutEndpoint(String uri) {
        return uri.contains("/shop/cart/checkout")
                || uri.contains("/shop/orders/checkout")
                || uri.contains("/payments/")
                || uri.contains("/checkout");
    }

    private Bucket createBucket(int requestsPerMinute) {
        Bandwidth limit = Bandwidth.classic(
                requestsPerMinute,
                Refill.intervally(requestsPerMinute, Duration.ofMinutes(1))
        );
        return Bucket4j.builder().addLimit(limit).build();
    }

    private void maybeCleanup() {
        long now = System.nanoTime();
        if (now - lastCleanupNanos > TimeUnit.MINUTES.toNanos(10)) {
            lastCleanupNanos = now;
            trimCacheIfNeeded(authBucketCache);
            trimCacheIfNeeded(checkoutBucketCache);
            trimCacheIfNeeded(userBucketCache);
            trimCacheIfNeeded(adminBucketCache);
            trimCacheIfNeeded(generalBucketCache);
        }
    }

    private void trimCacheIfNeeded(Map<String, Bucket> cache) {
        synchronized (cache) {
            if (cache.size() > MAX_BUCKETS_PER_TIER) {
                cache.clear();
            }
        }
    }

    private Object block(RequestContext ctx, HttpStatus status, String message, String error, String tier, int limit, long retryAfterSec) {
        ctx.setSendZuulResponse(false);
        ctx.setResponseStatusCode(status.value());
        ctx.setRouteHost(null);

        String json = "{\"error\":\"" + error + "\""
                + ",\"message\":\"" + escapeJson(message) + "\""
                + ",\"status\":" + status.value()
                + ",\"tier\":\"" + tier + "\""
                + ",\"limit\":" + limit
                + ",\"retryAfterSeconds\":" + retryAfterSec + "}";

        ctx.setResponseBody(json);
        if (ctx.getResponse() != null) {
            ctx.getResponse().setContentType("application/json;charset=UTF-8");
            ctx.getResponse().setHeader("Retry-After", String.valueOf(retryAfterSec));
            ctx.getResponse().setHeader("X-RateLimit-Limit", String.valueOf(limit));
            ctx.getResponse().setHeader("X-RateLimit-Remaining", "0");
            ctx.getResponse().setHeader("X-RateLimit-Reset", String.valueOf(retryAfterSec));
        }
        return null;
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return "unknown";
        String[] headerCandidates = {
                "CF-Connecting-IP",
                "X-Real-IP",
                "X-Forwarded-For",
                "True-Client-IP"
        };
        for (String header : headerCandidates) {
            String ipList = request.getHeader(header);
            if (ipList != null && !ipList.trim().isEmpty()) {
                String firstIp = ipList.split(",")[0].trim();
                if (!firstIp.isEmpty()) {
                    return firstIp;
                }
            }
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    private boolean isPrivateOrLocalIp(String ip) {
        if (ip == null) return true;
        return ip.startsWith("127.") || ip.startsWith("10.")
                || ip.startsWith("192.168.") || ip.startsWith("172.")
                || ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1")
                || ip.equalsIgnoreCase("localhost");
    }

    private String getHeaderCaseInsensitive(Map<String, String> headers, String targetKey) {
        if (headers == null || targetKey == null) return null;
        for (Map.Entry<String, String> entry : headers.entrySet()) {
            if (targetKey.equalsIgnoreCase(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder(s.length() + 16);
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '\\': sb.append("\\\\"); break;
                case '"': sb.append("\\\""); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
            }
        }
        return sb.toString();
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}