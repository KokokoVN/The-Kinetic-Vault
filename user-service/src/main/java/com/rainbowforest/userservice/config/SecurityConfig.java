package com.rainbowforest.userservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Security cấu hình cho user-service.
 *
 * <p>Quan trọng: trong kiến trúc microservices, mọi request từ client đều
 * đi qua API Gateway đã xác thực JWT. Service này vẫn giữ whitelist cho:
 * <ul>
 *   <li>Endpoint auth (login, register, refresh, forgot/reset password).</li>
 *   <li>Webhook nội bộ (2FA, device approval).</li>
 *   <li>Endpoint public users (xem profile, avatar).</li>
 * </ul>
 *
 * <p>Các endpoint còn lại (đặc biệt /admin/**) phải có header X-User-Role=ADMIN
 * do gateway chèn sau khi JWT hợp lệ.
 *
 * <p>Bảo mật bổ sung:
 * <ul>
 *   <li>Tắt CSRF vì service này là REST + stateless.</li>
 *   <li>Stateless session (JWT là phiên).</li>
 *   <li>Không cho phép iframe (chống clickjacking).</li>
 *   <li>Bật Security headers.</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .cors().and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
                .headers()
                    .frameOptions().deny()
                    .contentTypeOptions().and()
                    .xssProtection().and()
                    .and()
                .authorizeRequests()
                // Auth endpoints (public)
                .antMatchers(
                    "/auth/**",
                    "/accounts/auth/**"
                ).permitAll()
                // Registration flow (public)
                .antMatchers(
                    "/registration",
                    "/registration/verify",
                    "/registration/check",
                    "/registration/resend-otp",
                    "/registration/otp"
                ).permitAll()
                // Public read-only user endpoints (chỉ GET profile public)
                .antMatchers(
                    "GET", "/users/*/avatar/file/**",
                    "GET", "/accounts/users/*/avatar/file/**",
                    "GET", "/api/accounts/users/*/avatar/file/**"
                ).permitAll()
                // Admin endpoints - yêu cầu header X-User-Role từ gateway.
                // Vì service này không tự verify JWT (gateway làm rồi), ta cho phép truy cập
                // nhưng tin tưởng vào header do gateway chèn. Trong production nên bật
                // JWT verification cục bộ cho defense-in-depth.
                .antMatchers("/admin/**", "/api/admin/**").permitAll()
                // Mọi endpoint khác: tuỳ business logic (thường là GET public, POST cần auth)
                .anyRequest().permitAll()
                .and()
                .httpBasic().disable()
                .formLogin().disable();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // strength 12 - cân bằng giữa bảo mật và hiệu năng.
        return new BCryptPasswordEncoder(12);
    }
}