package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.dto.EmailOtpRequest;
import com.rainbowforest.userservice.dto.PasswordChangeRequest;
import com.rainbowforest.userservice.dto.VerifyEmailOtpRequest;
import com.rainbowforest.userservice.dto.UserProfileUpdateRequest;
import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;
import com.rainbowforest.userservice.service.TwoFactorAuthService;
import com.rainbowforest.userservice.dto.TwoFactorResponse;
import com.rainbowforest.userservice.dto.TwoFactorRequest;
import com.rainbowforest.userservice.repository.UserRepository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
public class UserProfileController {

    private final UserService userService;
    private final TwoFactorAuthService twoFactorAuthService;
    private final UserRepository userRepository;

    @Value("${app.avatar.upload-dir:uploads/avatars}")
    private String avatarUploadDir;

    @Value("${app.avatar.public-base-url:/api/accounts}")
    private String avatarPublicBaseUrl;

    public UserProfileController(UserService userService, TwoFactorAuthService twoFactorAuthService, UserRepository userRepository) {
        this.userService = userService;
        this.twoFactorAuthService = twoFactorAuthService;
        this.userRepository = userRepository;
    }

    @GetMapping("/users/{id}/profile")
    public ResponseEntity<User> getProfile(@PathVariable Long id) {
        User user = userService.getUserProfile(id);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/profile")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @RequestBody UserProfileUpdateRequest request) {
        User saved = userService.updateProfile(id, request);
        if (saved == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/users/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmailExists(@RequestParam String email) {
        if (email == null || email.trim().isEmpty() || !email.contains("@")) {
            return ResponseEntity.badRequest().build();
        }
        User existingUser = userService.findByEmail(email.trim().toLowerCase());
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", existingUser != null);
        return ResponseEntity.ok(response);
    }

    // Alias for gateway path
    @GetMapping("/accounts/users/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmailExistsAccounts(@RequestParam String email) {
        return checkEmailExists(email);
    }

    @PostMapping("/users/{id}/email/otp")
    public ResponseEntity<String> requestEmailChangeOtp(@PathVariable Long id, @RequestBody EmailOtpRequest request) {
        String result = userService.requestEmailChangeOtp(id, request);
        return result != null ? ResponseEntity.ok("OTP_SENT") : new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    // Alias for gateway path: /accounts/users/**
    @PostMapping("/accounts/users/{id}/email/otp")
    public ResponseEntity<String> requestEmailChangeOtpAccounts(@PathVariable Long id, @RequestBody EmailOtpRequest request) {
        return requestEmailChangeOtp(id, request);
    }

    @PostMapping("/users/{id}/email/confirm")
    public ResponseEntity<User> confirmEmailChange(@PathVariable Long id, @RequestBody VerifyEmailOtpRequest request) {
        User saved = userService.confirmEmailChange(id, request);
        return saved != null ? ResponseEntity.ok(saved) : new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/users/{id}/email/resend-otp")
    public ResponseEntity<String> resendEmailChangeOtp(@PathVariable Long id, @RequestBody EmailOtpRequest request) {
        String result = userService.resendEmailChangeOtp(id, request);
        return result != null ? ResponseEntity.ok("OTP_SENT") : new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    // Alias for gateway path: /accounts/users/**
    @PostMapping("/accounts/users/{id}/email/confirm")
    public ResponseEntity<User> confirmEmailChangeAccounts(@PathVariable Long id, @RequestBody VerifyEmailOtpRequest request) {
        return confirmEmailChange(id, request);
    }

    @PostMapping("/accounts/users/{id}/email/resend-otp")
    public ResponseEntity<String> resendEmailChangeOtpAccounts(@PathVariable Long id, @RequestBody EmailOtpRequest request) {
        return resendEmailChangeOtp(id, request);
    }

    @PostMapping("/users/{id}/email/verify")
    public ResponseEntity<String> verifyEmailChangeOtp(@PathVariable Long id, @RequestBody VerifyEmailOtpRequest request) {
        boolean ok = userService.verifyEmailChangeOtp(id, request);
        return ok ? ResponseEntity.ok("OTP_OK") : new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    // Alias for gateway path: /accounts/users/**
    @PostMapping("/accounts/users/{id}/email/verify")
    public ResponseEntity<String> verifyEmailChangeOtpAccounts(@PathVariable Long id, @RequestBody VerifyEmailOtpRequest request) {
        return verifyEmailChangeOtp(id, request);
    }

    @PatchMapping("/users/{id}/password")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @RequestBody PasswordChangeRequest request) {
        boolean ok = userService.changePassword(id, request);
        return ok ? new ResponseEntity<>(HttpStatus.NO_CONTENT) : new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/users/{id}/password/verify")
    public ResponseEntity<String> verifyPassword(@PathVariable Long id, @RequestBody PasswordChangeRequest request) {
        boolean ok = userService.verifyPassword(id, request.getCurrentPassword());
        return ok ? ResponseEntity.ok("PASSWORD_OK") : new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @PatchMapping("/accounts/users/{id}/password")
    public ResponseEntity<Void> changePasswordAccounts(@PathVariable Long id, @RequestBody PasswordChangeRequest request) {
        return changePassword(id, request);
    }

    @PostMapping("/accounts/users/{id}/password/verify")
    public ResponseEntity<String> verifyPasswordAccounts(@PathVariable Long id, @RequestBody PasswordChangeRequest request) {
        return verifyPassword(id, request);
    }

    @PostMapping({"/users/{id}/2fa/generate", "/accounts/users/{id}/2fa/generate"})
    public ResponseEntity<TwoFactorResponse> generate2faAccounts(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        String secret = twoFactorAuthService.generateNewSecret();
        user.setTotpSecret(secret);
        userRepository.save(user);
        String uri = twoFactorAuthService.generateQrCodeImageUri(secret, user.getEmail());
        return ResponseEntity.ok(new TwoFactorResponse(secret, uri));
    }

    @PostMapping({"/users/{id}/2fa/enable", "/accounts/users/{id}/2fa/enable"})
    public ResponseEntity<String> enable2faAccounts(@PathVariable Long id, @RequestBody TwoFactorRequest request) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null || user.getTotpSecret() == null) {
            System.out.println("2FA Enable failed: User or secret not found for id " + id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        System.out.println("Validating OTP: DB Secret=" + user.getTotpSecret() + ", Input Code=" + request.getCode());
        boolean isValid = twoFactorAuthService.isOtpValid(user.getTotpSecret(), request.getCode());
        System.out.println("OTP Valid? " + isValid);
        if (!isValid) return new ResponseEntity<>("INVALID_CODE", HttpStatus.BAD_REQUEST);
        user.setIs2faEnabled(true);
        userRepository.save(user);
        return ResponseEntity.ok("2FA_ENABLED");
    }

    @PostMapping({"/users/{id}/2fa/disable", "/accounts/users/{id}/2fa/disable"})
    public ResponseEntity<String> disable2faAccounts(@PathVariable Long id, @RequestBody PasswordChangeRequest request) {
        boolean ok = userService.verifyPassword(id, request.getCurrentPassword());
        if (!ok) return new ResponseEntity<>("INVALID_PASSWORD", HttpStatus.BAD_REQUEST);
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            user.setIs2faEnabled(false);
            user.setTotpSecret(null);
            userRepository.save(user);
        }
        return ResponseEntity.ok("2FA_DISABLED");
    }

    // Alias for gateway path: /accounts/users/**
    @GetMapping("/accounts/users/{id}/profile")
    public ResponseEntity<User> getProfileAccounts(@PathVariable Long id) {
        return getProfile(id);
    }

    // Alias for gateway path: /accounts/users/**
    @PutMapping("/accounts/users/{id}/profile")
    public ResponseEntity<User> updateProfileAccounts(@PathVariable Long id, @RequestBody UserProfileUpdateRequest request) {
        return updateProfile(id, request);
    }

    @PostMapping(
            value = {"/users/{id}/avatar", "/accounts/users/{id}/avatar", "/api/accounts/users/{id}/avatar"},
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @PathVariable("id") Long id,
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "performedBy", required = false) String performedBy
    ) {
        if (id == null || id <= 0 || file == null || file.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        String rawContentType = file.getContentType();
        String contentType = rawContentType != null ? rawContentType.toLowerCase(Locale.ROOT) : "";
        if (!contentType.startsWith("image/")) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > 5L * 1024 * 1024) {
            return new ResponseEntity<>(HttpStatus.PAYLOAD_TOO_LARGE);
        }
        try {
            Path root = Paths.get(avatarUploadDir).toAbsolutePath().normalize();
            Path userDir = root.resolve(String.valueOf(id)).normalize();
            Files.createDirectories(userDir);
            String ext = extensionFrom(file.getOriginalFilename());
            String fileName = UUID.randomUUID().toString().replace("-", "") + ext;
            Path target = userDir.resolve(fileName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String publicBase = String.valueOf(avatarPublicBaseUrl).trim();
            if (publicBase.isEmpty()) {
                publicBase = "/api/accounts";
            }
            if (!publicBase.startsWith("/")) {
                publicBase = "/" + publicBase;
            }
            String avatarUrl = publicBase + "/users/" + id + "/avatar/file/" + fileName;
            User saved = userService.updateAvatar(id, avatarUrl, performedBy);
            if (saved == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            Map<String, String> response = new HashMap<>();
            response.put("avatarUrl", avatarUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value = {"/users/{id}/avatar/file/{fileName:.+}", "/accounts/users/{id}/avatar/file/{fileName:.+}", "/api/accounts/users/{id}/avatar/file/{fileName:.+}"})
    public ResponseEntity<Resource> getAvatarFile(
            @PathVariable("id") Long id,
            @PathVariable("fileName") String fileName
    ) {
        try {
            Path root = Paths.get(avatarUploadDir).toAbsolutePath().normalize();
            Path file = root.resolve(String.valueOf(id)).resolve(fileName).normalize();
            if (!Files.exists(file) || !file.startsWith(root)) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            Resource resource = new UrlResource(Objects.requireNonNull(file.toFile().toURI()));
            String contentType = Files.probeContentType(file);
            if (contentType == null || contentType.trim().isEmpty()) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    private String extensionFrom(String name) {
        String fallback = ".jpg";
        if (name == null) return fallback;
        int idx = name.lastIndexOf('.');
        if (idx < 0 || idx == name.length() - 1) return fallback;
        String ext = name.substring(idx).toLowerCase(Locale.ROOT);
        if (ext.matches("\\.[a-z0-9]{1,8}")) {
            return ext;
        }
        return fallback;
    }
}
