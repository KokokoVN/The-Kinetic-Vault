package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.dto.JwtAuthenticationResponse;
import com.rainbowforest.userservice.dto.LoginRequest;
import com.rainbowforest.userservice.dto.RefreshTokenRequest;
import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.security.JwtTokenProvider;
import com.rainbowforest.userservice.service.UserService;
import com.rainbowforest.userservice.service.UserServiceImpl;
import com.rainbowforest.userservice.service.TwoFactorAuthService;
import com.rainbowforest.userservice.repository.UserRepository;
import io.jsonwebtoken.Claims;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final TwoFactorAuthService twoFactorAuthService;
    private final UserRepository userRepository;

    public AuthController(UserService userService, JwtTokenProvider jwtTokenProvider, TwoFactorAuthService twoFactorAuthService, UserRepository userRepository) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.twoFactorAuthService = twoFactorAuthService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String identity = request != null && request.getUsername() != null ? request.getUsername().trim() : "";
        String rawPassword = request != null && request.getPassword() != null ? request.getPassword() : "";
        if (identity.isEmpty() || rawPassword.trim().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Optional<User> userOpt;
        try {
            userOpt = userService.authenticate(identity, rawPassword);
        } catch (IllegalArgumentException e) {
            if (e.getMessage() != null && e.getMessage().startsWith("ACCOUNT_LOCKED|")) {
                Map<String, String> payload = new HashMap<>();
                payload.put("error", "ACCOUNT_LOCKED");
                payload.put("message", e.getMessage().split("\\|", 2)[1]);
                return new ResponseEntity<>(payload, HttpStatus.LOCKED);
            }
            throw e;
        }

        if (!userOpt.isPresent()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        User user = userOpt.get();
        String clientIp = extractClientIp(httpRequest);
        String deviceLabel = buildDeviceLabel(httpRequest, request.getDeviceLabel(), request.getTimeZone(), request.getLocale());
        String fingerprint = request.getDeviceFingerprint() != null && !request.getDeviceFingerprint().trim().isEmpty()
                ? request.getDeviceFingerprint().trim()
                : UserServiceImpl.buildDeviceFingerprint(deviceLabel + "|" + clientIp);

        if (Boolean.TRUE.equals(user.getIs2faEnabled())) {
            Map<String, Object> payload2fa = new HashMap<>();
            payload2fa.put("error", "LOGIN_2FA_REQUIRED");
            payload2fa.put("message", "Vui lòng xác thực 2 bước (MFA).");
            payload2fa.put("hasApp", true);
            // We can still send Email OTP as a fallback
            userService.requestLoginDeviceApproval(
                    user,
                    fingerprint,
                    deviceLabel,
                    clientIp,
                    trimToNull(request.getLocation()),
                    trimToNull(request.getTimeZone()),
                    trimToNull(request.getLocale()));
            return new ResponseEntity<>(payload2fa, HttpStatus.PRECONDITION_REQUIRED);
        }

        userService.requestLoginDeviceApproval(
                user,
                fingerprint,
                deviceLabel,
                clientIp,
                trimToNull(request.getLocation()),
                trimToNull(request.getTimeZone()),
                trimToNull(request.getLocale()));

        Map<String, String> payload = new HashMap<>();
        payload.put("error", "LOGIN_OTP_REQUIRED");
        payload.put("message", "OTP đăng nhập đã được gửi về email của bạn.");
        return new ResponseEntity<>(payload, HttpStatus.PRECONDITION_REQUIRED);
    }

    @PostMapping("/passwordless/request")
    public ResponseEntity<?> requestPasswordlessLogin(@RequestBody Map<String, String> requestPayload, HttpServletRequest httpRequest) {
        String identity = requestPayload != null && requestPayload.get("identity") != null ? requestPayload.get("identity").trim() : "";
        if (identity.isEmpty()) {
            Map<String, String> bad = new HashMap<>();
            bad.put("error", "MISSING_IDENTITY");
            bad.put("message", "Vui lòng nhập Email hoặc Username.");
            return new ResponseEntity<>(bad, HttpStatus.BAD_REQUEST);
        }

        User user = userService.getUserByUsernameOrEmail(identity);
        if (user == null || !user.isActivated()) {
            // Vẫn trả về 200 OK để chống dò quét tài khoản
            Map<String, String> ok = new HashMap<>();
            ok.put("message", "Nếu tài khoản tồn tại và có email, mã OTP đã được gửi.");
            return ResponseEntity.ok(ok);
        }

        if (user.getLockoutEndTime() != null && user.getLockoutEndTime().isAfter(LocalDateTime.now())) {
            Map<String, String> locked = new HashMap<>();
            locked.put("error", "ACCOUNT_LOCKED");
            locked.put("message", "Tài khoản đang bị khóa, không thể đăng nhập.");
            return new ResponseEntity<>(locked, HttpStatus.LOCKED);
        }

        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            Map<String, String> bad = new HashMap<>();
            bad.put("error", "EMAIL_REQUIRED");
            bad.put("message", "Tài khoản này chưa đăng ký địa chỉ email. Vui lòng đăng nhập bằng mật khẩu.");
            return new ResponseEntity<>(bad, HttpStatus.BAD_REQUEST);
        }

        String clientIp = extractClientIp(httpRequest);
        String deviceLabel = buildDeviceLabel(httpRequest, requestPayload.get("deviceLabel"), null, null);
        String fingerprint = requestPayload.get("deviceFingerprint") != null && !requestPayload.get("deviceFingerprint").trim().isEmpty()
                ? requestPayload.get("deviceFingerprint").trim()
                : UserServiceImpl.buildDeviceFingerprint(deviceLabel + "|" + clientIp);

        userService.requestLoginDeviceApproval(user, fingerprint, deviceLabel, clientIp, null, null, null);

        Map<String, String> ok = new HashMap<>();
        ok.put("message", "Mã OTP đã được gửi vào email của bạn.");
        return ResponseEntity.ok(ok);
    }

    @GetMapping("/device-approval/verify")
    public ResponseEntity<?> verifyLoginDevice(@RequestParam("token") String token) {
        User user = userService.approveLoginDevice(token);
        if (user != null) {
            return ResponseEntity.ok(buildAuthResponse(user));
        }
        return new ResponseEntity<>("INVALID_OR_EXPIRED_TOKEN", HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/login-otp/verify")
    public ResponseEntity<?> verifyLoginOtp(@RequestBody Map<String, String> payload) {
        String identity = payload != null && payload.get("identity") != null ? payload.get("identity").trim() : "";
        String otp = payload != null && payload.get("otp") != null ? payload.get("otp").trim() : "";
        String deviceFingerprint = payload != null && payload.get("deviceFingerprint") != null ? payload.get("deviceFingerprint").trim() : "";
        if (identity.isEmpty() || otp.isEmpty() || deviceFingerprint.isEmpty()) {
            Map<String, String> bad = new HashMap<>();
            bad.put("error", "MISSING_PARAMS");
            bad.put("message", "Thiếu thông tin để xác thực OTP đăng nhập.");
            return new ResponseEntity<>(bad, HttpStatus.BAD_REQUEST);
        }
        User user = userService.verifyLoginOtp(identity, otp, deviceFingerprint);
        if (user == null) {
            Map<String, String> bad = new HashMap<>();
            bad.put("error", "INVALID_OTP");
            bad.put("message", "OTP đăng nhập không hợp lệ hoặc đã hết hạn.");
            return new ResponseEntity<>(bad, HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(buildAuthResponse(user));
    }

    @PostMapping("/login-2fa/verify")
    public ResponseEntity<?> verifyLogin2fa(@RequestBody Map<String, String> payload) {
        String identity = payload != null && payload.get("identity") != null ? payload.get("identity").trim() : "";
        String code = payload != null && payload.get("code") != null ? payload.get("code").trim() : "";
        if (identity.isEmpty() || code.isEmpty()) {
            Map<String, String> bad = new HashMap<>();
            bad.put("error", "MISSING_PARAMS");
            bad.put("message", "Thiếu thông tin xác thực 2FA.");
            return new ResponseEntity<>(bad, HttpStatus.BAD_REQUEST);
        }
        User user = userRepository.findByEmail(identity);
        if (user == null) {
            user = userRepository.findByUserName(identity);
        }
        if (user == null || user.getTotpSecret() == null) {
            Map<String, String> bad = new HashMap<>();
            bad.put("error", "INVALID_2FA");
            bad.put("message", "Tài khoản không tồn tại hoặc chưa bật 2FA.");
            return new ResponseEntity<>(bad, HttpStatus.BAD_REQUEST);
        }

        boolean isValid = twoFactorAuthService.isOtpValid(user.getTotpSecret(), code);
        if (!isValid) {
            Map<String, String> bad = new HashMap<>();
            bad.put("error", "INVALID_2FA");
            bad.put("message", "Mã xác thực không hợp lệ.");
            return new ResponseEntity<>(bad, HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(buildAuthResponse(user));
    }

    @PostMapping("/login-otp/resend")
    public ResponseEntity<?> resendLoginOtp(@RequestBody Map<String, String> payload) {
        String identity = payload != null && payload.get("identity") != null ? payload.get("identity").trim() : "";
        String deviceFingerprint = payload != null && payload.get("deviceFingerprint") != null ? payload.get("deviceFingerprint").trim() : "";
        if (identity.isEmpty() || deviceFingerprint.isEmpty()) {
            Map<String, String> bad = new HashMap<>();
            bad.put("error", "MISSING_PARAMS");
            bad.put("message", "Thiếu thông tin để gửi lại OTP đăng nhập.");
            return new ResponseEntity<>(bad, HttpStatus.BAD_REQUEST);
        }
        String result = userService.resendLoginOtp(identity, deviceFingerprint);
        if (result == null) {
            Map<String, String> bad = new HashMap<>();
            bad.put("error", "OTP_NOT_FOUND");
            bad.put("message", "Không tìm thấy yêu cầu OTP đăng nhập hợp lệ.");
            return new ResponseEntity<>(bad, HttpStatus.NOT_FOUND);
        }
        Map<String, String> ok = new HashMap<>();
        ok.put("message", "OTP_SENT");
        return ResponseEntity.ok(ok);
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtAuthenticationResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            Claims claims = jwtTokenProvider.parseClaims(request.getRefreshToken());
            if (!jwtTokenProvider.isRefreshToken(claims)) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            Object uidObj = claims.get("uid");
            if (uidObj == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            long uid = ((Number) uidObj).longValue();
            User user = userService.getUserById(uid);
            if (user == null || !user.isActivated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            return ResponseEntity.ok(buildAuthResponse(user));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/password/forgot")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String identity = payload != null && payload.get("identity") != null ? payload.get("identity").trim() : "";
        if (identity.isEmpty()) {
            Map<String, String> bad = new HashMap<>();
            bad.put("error", "MISSING_IDENTITY");
            bad.put("message", "Vui lòng nhập username/email/số điện thoại.");
            return new ResponseEntity<>(bad, HttpStatus.BAD_REQUEST);
        }
        userService.requestPasswordReset(identity);
        Map<String, String> body = new HashMap<>();
        body.put("message", "Nếu thông tin tài khoản hợp lệ, email đặt lại mật khẩu đã được gửi.");
        return ResponseEntity.ok(body);
    }

    @PostMapping("/password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload != null && payload.get("token") != null ? payload.get("token").trim() : "";
        String newPassword = payload != null && payload.get("newPassword") != null ? payload.get("newPassword").trim() : "";
        if (token.isEmpty() || newPassword.length() < 8) {
            Map<String, String> bad = new HashMap<>();
            bad.put("error", "INVALID_INPUT");
            bad.put("message", "Token hoặc mật khẩu mới không hợp lệ.");
            return new ResponseEntity<>(bad, HttpStatus.BAD_REQUEST);
        }
        boolean ok = userService.resetPassword(token, newPassword);
        if (!ok) {
            Map<String, String> body = new HashMap<>();
            body.put("error", "INVALID_OR_EXPIRED_TOKEN");
            body.put("message", "Token đặt lại mật khẩu không hợp lệ, đã hết hạn hoặc mật khẩu chưa đạt yêu cầu.");
            return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
        }
        Map<String, String> body = new HashMap<>();
        body.put("message", "Đặt lại mật khẩu thành công.");
        return ResponseEntity.ok(body);
    }

    private JwtAuthenticationResponse buildAuthResponse(User user) {
        String role = user.getRole() != null ? user.getRole().getRoleName() : "ROLE_USER";
        String access = jwtTokenProvider.createAccessToken(user.getId(), user.getUserName(), role);
        String refresh = jwtTokenProvider.createRefreshToken(user.getId(), user.getUserName());
        return new JwtAuthenticationResponse(
                access,
                refresh,
                jwtTokenProvider.getAccessExpirationMs(),
                jwtTokenProvider.getRefreshExpirationMs(),
                user.getId(),
                user.getUserName(),
                role);
    }

    private static String buildDeviceLabel(HttpServletRequest request, String clientDeviceLabel, String timeZone, String locale) {
        String ua = request != null ? String.valueOf(request.getHeader("User-Agent")) : "";
        String lang = request != null ? String.valueOf(request.getHeader("Accept-Language")) : "";
        String coreUa = ua != null ? ua.trim() : "";
        String coreLang = lang != null ? lang.trim() : "";
        String preferredLabel = clientDeviceLabel != null ? clientDeviceLabel.trim() : "";
        String label = !preferredLabel.isEmpty()
                ? preferredLabel
                : (coreUa.length() > 180 ? coreUa.substring(0, 180) : coreUa);
        StringBuilder extra = new StringBuilder();
        if (timeZone != null && !timeZone.trim().isEmpty()) {
            extra.append(" | TZ ").append(timeZone.trim());
        }
        if (locale != null && !locale.trim().isEmpty()) {
            extra.append(" | ").append(locale.trim());
        } else if (!coreLang.isEmpty()) {
            extra.append(" | ").append(coreLang);
        }
        return (label + extra).trim();
    }

    private static String extractClientIp(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.trim().isEmpty()) {
            String[] parts = xff.split(",");
            if (parts.length > 0) {
                return parts[0].trim();
            }
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.trim().isEmpty()) {
            return realIp.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr().trim() : "";
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
