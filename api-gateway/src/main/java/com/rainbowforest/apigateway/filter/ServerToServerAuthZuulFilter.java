package com.rainbowforest.apigateway.filter;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

/**
 * Zuul Pre-Filter: Đính kèm Header X-Internal-Secret vào các request chuyển đến Microservices nội bộ (Item 6).
 *
 * <p>Cải tiến bảo mật:
 * <ul>
 *   <li>Không dùng fallback hardcoded - buộc cấu hình qua biến môi trường / config.</li>
 *   <li>Validate secret có đủ độ dài tối thiểu (32 ký tự) khi khởi động.</li>
 *   <li>Log cảnh báo nếu còn dùng giá trị placeholder / dev.</li>
 * </ul>
 */
@Component
public class ServerToServerAuthZuulFilter extends ZuulFilter {

    private static final Logger log = LoggerFactory.getLogger(ServerToServerAuthZuulFilter.class);
    private static final int MIN_SECRET_LENGTH = 32;

    @Value("${internal.service.secret:}")
    private String internalSecret;

    @PostConstruct
    public void validateSecret() {
        if (internalSecret == null || internalSecret.trim().isEmpty()) {
            throw new IllegalStateException(
                "internal.service.secret chưa được cấu hình. Vui lòng đặt giá trị >= "
                + MIN_SECRET_LENGTH + " ký tự trong application.properties hoặc biến môi trường INTERNAL_SERVICE_SECRET.");
        }
        if (internalSecret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(
                "internal.service.secret quá ngắn ("
                + internalSecret.length() + " ký tự). Cần tối thiểu " + MIN_SECRET_LENGTH
                + " ký tự. Tạo bằng: openssl rand -base64 48");
        }
        if (internalSecret.contains("CHANGE_ME") || internalSecret.contains("SuperSecret")) {
            log.warn("[SECURITY] internal.service.secret đang dùng giá trị placeholder. Hãy thay bằng giá trị ngẫu nhiên mạnh trước khi lên production!");
        }
    }

    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        // Chạy sau Authentication Filter (order 2)
        return 2;
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        ctx.addZuulRequestHeader("X-Internal-Secret", internalSecret);
        return null;
    }
}