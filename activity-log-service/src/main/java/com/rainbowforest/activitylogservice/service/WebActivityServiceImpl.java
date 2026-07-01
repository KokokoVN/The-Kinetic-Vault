package com.rainbowforest.activitylogservice.service;

import com.rainbowforest.activitylogservice.dto.WebActivityRequest;
import com.rainbowforest.activitylogservice.entity.WebActivity;
import com.rainbowforest.activitylogservice.repository.WebActivityRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Transactional
public class WebActivityServiceImpl implements WebActivityService {
    private static final Pattern NUMERIC_SEGMENT = Pattern.compile("(^|/)(\\d+)(/|$)");

    private final WebActivityRepository webActivityRepository;

    public WebActivityServiceImpl(WebActivityRepository webActivityRepository) {
        this.webActivityRepository = webActivityRepository;
    }

    @Override
    public WebActivity log(WebActivityRequest req) {
        WebActivity a = new WebActivity();
        a.setActorUserId(req.getActorUserId());
        a.setActorUsername(req.getActorUsername());
        a.setAction(req.getAction());
        String normalizedPath = stripQuery(req.getRequestPath());
        a.setResourceType(resolveResourceType(req.getResourceType(), req.getAction(), normalizedPath));
        a.setResourceId(resolveResourceId(req.getResourceId(), normalizedPath));
        a.setHttpMethod(req.getHttpMethod());
        a.setRequestPath(normalizedPath);
        a.setIpAddress(req.getIpAddress());
        a.setUserAgent(req.getUserAgent());
        a.setDetailJson(req.getDetailJson());
        if (req.getPerformedBy() != null) {
            a.setCreatedBy(req.getPerformedBy());
            a.setUpdatedBy(req.getPerformedBy());
        }
        return webActivityRepository.save(a);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<WebActivity> findById(Long id) {
        return webActivityRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WebActivity> recent(int limit) {
        return webActivityRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, Math.min(limit, 500)));
    }

    @Override
    public int deleteByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        List<Long> normalized = ids.stream()
                .filter(v -> v != null && v > 0L)
                .distinct()
                .collect(Collectors.toList());
        if (normalized.isEmpty()) {
            return 0;
        }
        long existing = webActivityRepository.countByIdIn(normalized);
        if (existing <= 0L) {
            return 0;
        }
        webActivityRepository.deleteByIds(normalized);
        return (int) Math.min(existing, Integer.MAX_VALUE);
    }

    private static String stripQuery(String requestPath) {
        String path = trimToNull(requestPath);
        if (path == null) {
            return null;
        }
        int q = path.indexOf('?');
        return q >= 0 ? path.substring(0, q) : path;
    }

    private static String resolveResourceType(String requestedType, String action, String requestPath) {
        String direct = trimToNull(requestedType);
        if (direct != null) {
            return direct;
        }
        String path = lowerPath(requestPath);
        String act = trimToNull(action) == null ? "" : action.trim().toLowerCase();

        if (path.contains("/catalog/admin/products") || path.contains("/catalog/products")) return "Product";
        if (path.contains("/catalog/admin/categories") || path.contains("/catalog/categories")) return "Category";
        if (path.contains("/shop/orders")) return "Order";
        if (path.contains("/shop/cart") || path.contains("/shop/carts")) return "Cart";
        if (path.contains("/inventory")) return "Inventory";
        if (path.contains("/notifications") || path.contains("/send")) return "NotificationMessage";
        if (path.contains("/accounts/users") || path.contains("/users")) return "User";
        if (path.contains("/auth") || path.contains("/login") || path.contains("/register")) return "Auth";
        if (path.contains("/activity")) return "ActivityLog";
        if (path.contains("/gateway") || act.contains("gateway")) return "Gateway";
        return "System";
    }

    private static String resolveResourceId(String requestedId, String requestPath) {
        String direct = trimToNull(requestedId);
        if (direct != null) {
            return direct;
        }
        String path = trimToNull(requestPath);
        if (path == null) {
            return null;
        }

        String fromProducts = extractIdAfter(path, "products");
        if (fromProducts != null) return fromProducts;
        String fromCategories = extractIdAfter(path, "categories");
        if (fromCategories != null) return fromCategories;
        String fromOrders = extractIdAfter(path, "orders");
        if (fromOrders != null) return fromOrders;
        String fromUsers = extractIdAfter(path, "users");
        if (fromUsers != null) return fromUsers;
        String fromNotifications = extractIdAfter(path, "notifications");
        if (fromNotifications != null) return fromNotifications;
        String fromWarehouses = extractIdAfter(path, "warehouses");
        if (fromWarehouses != null) return fromWarehouses;

        Matcher matcher = NUMERIC_SEGMENT.matcher(path);
        if (matcher.find()) {
            return matcher.group(2);
        }
        return null;
    }

    private static String extractIdAfter(String path, String keyword) {
        String[] segs = path.split("/");
        for (int i = 0; i < segs.length - 1; i++) {
            if (keyword.equalsIgnoreCase(segs[i])) {
                String candidate = trimToNull(segs[i + 1]);
                if (candidate != null && !isIgnoredSegment(candidate)) {
                    return candidate;
                }
            }
        }
        return null;
    }

    private static boolean isIgnoredSegment(String value) {
        String v = value.toLowerCase();
        return "admin".equals(v)
                || "new".equals(v)
                || "edit".equals(v)
                || "detail".equals(v)
                || "inbound".equals(v)
                || "images".equals(v)
                || "variants".equals(v)
                || "specs".equals(v)
                || "check-name".equals(v)
                || "manual".equals(v)
                || "status".equals(v);
    }

    private static String lowerPath(String requestPath) {
        String path = trimToNull(requestPath);
        return path == null ? "" : path.toLowerCase();
    }

    private static String trimToNull(String v) {
        if (v == null) return null;
        String s = v.trim();
        return s.isEmpty() ? null : s;
    }
}
