package com.rainbowforest.apigateway.filter;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Zuul Post-Filter: Thêm Security Headers (Item 18), HSTS (Item 19) & Cấu hình Cookie An Toàn (Item 10).
 *
 * <p>Cải tiến:
 * <ul>
 *   <li>Permissions-Policy header chống lạm dụng API.</li>
 *   <li>Cache-Control no-store cho response chứa token / auth.</li>
 *   <li>Xử lý đa Set-Cookie headers đúng cách.</li>
 * </ul>
 */
@Component
public class SecurityHeadersPostZuulFilter extends ZuulFilter {

    @Value("${app.security.cookie-secure:false}")
    private boolean cookieSecure;

    @Override
    public String filterType() {
        return "post";
    }

    @Override
    public int filterOrder() {
        return 999;
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletResponse response = ctx.getResponse();

        if (response != null) {
            // Security Headers (Item 18)
            response.setHeader("X-Content-Type-Options", "nosniff");
            response.setHeader("X-Frame-Options", "DENY");
            response.setHeader("X-XSS-Protection", "1; mode=block");
            response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            // CSP: tăng cường chống XSS. Lưu ý 'unsafe-inline' cho script cần thiết với Next.js dev.
            // Production nên dùng nonce-based CSP.
            response.setHeader("Content-Security-Policy",
                "default-src 'self'; "
                + "img-src 'self' data: https:; "
                + "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                + "style-src 'self' 'unsafe-inline'; "
                + "font-src 'self' data: https:; "
                + "connect-src 'self' https:; "
                + "frame-ancestors 'none'");

            // HSTS (Item 19) - chỉ effective khi chạy trên HTTPS
            response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

            // Permissions-Policy (chống lạm dụng camera/mic/geolocation)
            response.setHeader("Permissions-Policy",
                "camera=(), microphone=(), geolocation=(), payment=()");

            // Cache-Control: không cache các response có chứa thông tin auth
            String requestPath = ctx.getRequest() != null ? ctx.getRequest().getRequestURI() : "";
            if (requestPath != null && (requestPath.contains("/auth/")
                    || requestPath.contains("/accounts/")
                    || requestPath.contains("/admin/")
                    || requestPath.contains("/payments/"))) {
                response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
                response.setHeader("Pragma", "no-cache");
                response.setDateHeader("Expires", 0);
            }

            // Định dạng Set-Cookie headers (Item 10): thêm SameSite, HttpOnly, Secure
            // Lưu ý: getHeaders() trả về tất cả giá trị cho cùng header name.
            Collection<String> setCookies = response.getHeaders("Set-Cookie");
            if (setCookies != null && !setCookies.isEmpty()) {
                List<String> updated = new ArrayList<>();
                for (String cookie : setCookies) {
                    if (cookie == null) continue;
                    StringBuilder sb = new StringBuilder(cookie);
                    if (!cookie.toLowerCase().contains("samesite=")) {
                        sb.append("; SameSite=Lax");
                    }
                    if (!cookie.toLowerCase().contains("httponly")) {
                        sb.append("; HttpOnly");
                    }
                    if (cookieSecure && !cookie.toLowerCase().contains("secure")) {
                        sb.append("; Secure");
                    }
                    updated.add(sb.toString());
                }
                // Response đã được commit thì không thể setHeader; Zuul set header qua HttpServletResponse wrapper.
                // Ta chỉ patch nếu response chưa commit.
                try {
                    boolean first = true;
                    for (String cookieVal : updated) {
                        if (first) {
                            response.setHeader("Set-Cookie", cookieVal);
                            first = false;
                        } else {
                            response.addHeader("Set-Cookie", cookieVal);
                        }
                    }
                } catch (IllegalStateException ignored) {
                    // Response đã commit - không thể đổi.
                }
            }
        }

        return null;
    }
}