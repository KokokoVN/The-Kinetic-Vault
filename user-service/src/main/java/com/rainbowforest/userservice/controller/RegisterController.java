package com.rainbowforest.userservice.controller;

import com.rainbowforest.activitylog.ActivityLogPublisher;
import com.rainbowforest.userservice.activity.UserActivityLogSupport;
import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
public class RegisterController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private ActivityLogPublisher activityLogPublisher;

    @Autowired
    private UserRepository userRepository;
    
    @PostMapping(value = "/registration")
    public ResponseEntity<Map<String, Object>> addUser(@RequestBody User user, HttpServletRequest request) {
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        user.setRole(null);
        try {
            User pending = userService.registerUser(user);
            if (pending == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            try {
                activityLogPublisher.publish(
                        "user-service",
                        "USER_REGISTER_PENDING",
                        "User",
                        pending.getUserName(),
                        "POST",
                        "/registration",
                        UserActivityLogSupport.detailAfterUser(pending),
                        pending.getUserName(),
                        null);
            } catch (Exception ignored) {
            }
            Map<String, Object> body = new HashMap<>();
            body.put("message", "OTP đã được gửi tới email/số điện thoại đã đăng ký. Vui lòng nhập OTP để hoàn tất.");
            body.put("identity", pending.getEmail() != null && !pending.getEmail().trim().isEmpty() ? pending.getEmail() : pending.getPhoneNumber());
            body.put("activated", false);
            return new ResponseEntity<>(body, HttpStatus.ACCEPTED);
        } catch (DataIntegrityViolationException dup) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping(value = "/registration/verify")
    public ResponseEntity<Map<String, Object>> verifyUser(@RequestParam(value = "token", required = false) String token,
                                                           @RequestParam(value = "identity", required = false) String identity,
                                                           @RequestParam(value = "otp", required = false) String otp) {
        boolean activated = false;
        if (identity != null && otp != null && !identity.trim().isEmpty() && !otp.trim().isEmpty()) {
            activated = userService.verifyPendingRegistration(identity.trim(), otp.trim());
            if (!activated) {
                activated = userService.verifyActivationOtp(identity.trim(), otp.trim());
            }
        } else if (token != null && !token.trim().isEmpty()) {
            activated = userService.activateUser(token.trim());
        } else {
            Map<String, Object> bad = new HashMap<>();
            bad.put("ok", false);
            bad.put("error", "MISSING_PARAMS");
            return new ResponseEntity<>(bad, HttpStatus.BAD_REQUEST);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("ok", activated);
        body.put("message", activated ? "ACCOUNT_ACTIVATED" : "INVALID_OR_EXPIRED_TOKEN");
        return new ResponseEntity<>(body, activated ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }

    @GetMapping(value = "/registration/check")
    public ResponseEntity<Map<String, Object>> checkRegistrationAvailability(
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "contact", required = false) String contact,
            @RequestParam(value = "identity", required = false) String identity) {
        String u = username != null ? username.trim() : "";
        String c = contact != null ? contact.trim() : "";
        String id = identity != null ? identity.trim() : "";

        boolean usernameExists = !u.isEmpty() && userRepository.findByUserName(u) != null;
        boolean contactExists = false;
        if (!c.isEmpty()) {
            contactExists = userService.getUserByUsernameOrEmail(c) != null;
        } else if (!id.isEmpty()) {
            contactExists = userService.getUserByUsernameOrEmail(id) != null;
        }

        Map<String, Object> out = new HashMap<>();
        out.put("usernameExists", usernameExists);
        out.put("contactExists", contactExists);
        out.put("identityExists", contactExists);
        return ResponseEntity.ok(out);
    }

    @PostMapping(value = "/registration/resend-otp")
    public ResponseEntity<Map<String, Object>> resendActivationOtp(
            @RequestBody(required = false) Map<String, String> payload,
            @RequestParam(value = "identity", required = false) String identityParam) {

        String identity = payload != null && payload.get("identity") != null ? payload.get("identity").trim() : "";
        if (identity.isEmpty()) {
            identity = identityParam != null ? identityParam.trim() : "";
        }
        if (identity.isEmpty()) {
            Map<String, Object> bad = new HashMap<>();
            bad.put("ok", false);
            bad.put("error", "MISSING_IDENTITY");
            bad.put("message", "Thiếu identity để gửi lại OTP.");
            return new ResponseEntity<>(bad, HttpStatus.BAD_REQUEST);
        }

        String result = userService.resendPendingRegistrationOtp(identity);
        String flow = "PENDING_REGISTRATION";
        if (result == null) {
            result = userService.resendActivationOtp(identity);
            flow = "ACTIVATION";
        }
        if (result == null) {
            Map<String, Object> notFound = new HashMap<>();
            notFound.put("ok", false);
            notFound.put("error", "OTP_NOT_FOUND");
            notFound.put("message", "Không tìm thấy OTP hợp lệ để gửi lại.");
            return new ResponseEntity<>(notFound, HttpStatus.NOT_FOUND);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("ok", true);
        body.put("message", "OTP_SENT");
        body.put("flow", flow);
        body.put("identity", identity);
        body.put("resent", true);
        return ResponseEntity.ok(body);
    }

}
