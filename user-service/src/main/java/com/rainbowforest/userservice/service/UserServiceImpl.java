package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserAddress;
import com.rainbowforest.userservice.entity.UserActivationToken;
import com.rainbowforest.userservice.entity.UserDetails;
import com.rainbowforest.userservice.entity.UserLoginDevice;
import com.rainbowforest.userservice.entity.UserLoginDeviceApprovalToken;
import com.rainbowforest.userservice.entity.UserPasswordResetToken;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.activitylog.ActivityLogPublisher;
import com.rainbowforest.userservice.activity.UserActivityLogSupport;
import com.rainbowforest.userservice.dto.EmailOtpRequest;
import com.rainbowforest.userservice.dto.PasswordChangeRequest;
import com.rainbowforest.userservice.dto.UserAddressUpsertRequest;
import com.rainbowforest.userservice.dto.UserProfileUpdateRequest;
import com.rainbowforest.userservice.dto.UserRoleUpdateRequest;
import com.rainbowforest.userservice.dto.VerifyEmailOtpRequest;
import com.rainbowforest.userservice.repository.UserActivationTokenRepository;
import com.rainbowforest.userservice.repository.UserAddressRepository;
import com.rainbowforest.userservice.repository.UserLoginDeviceApprovalTokenRepository;
import com.rainbowforest.userservice.repository.UserLoginDeviceRepository;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import com.rainbowforest.userservice.repository.UserPasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private UserActivationTokenRepository userActivationTokenRepository;

    @Autowired
    private UserLoginDeviceRepository userLoginDeviceRepository;

    @Autowired
    private UserLoginDeviceApprovalTokenRepository userLoginDeviceApprovalTokenRepository;

    @Autowired
    private UserPasswordResetTokenRepository userPasswordResetTokenRepository;

    @Autowired
    private com.rainbowforest.userservice.repository.UserProfileChangeLogRepository userProfileChangeLogRepository;

    @Autowired(required = false)
    private ActivityLogPublisher activityLogPublisher;

    private final Map<Long, PendingEmailChange> pendingEmailChanges = new ConcurrentHashMap<>();
    private final Map<String, PendingRegistration> pendingRegistrations = new ConcurrentHashMap<>();

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.activation.verify-base-url:http://localhost:3000/register/verify}")
    private String verifyBaseUrl;

    @Value("${app.activation.token-expire-hours:24}")
    private long tokenExpireHours;

    @Value("${app.notification.send-url:http://localhost:8815/send}")
    private String notificationSendUrl;

    @Value("${app.login-device.verify-base-url:http://localhost:3000/api/auth/device-approval}")
    private String loginDeviceVerifyBaseUrl;

    @Value("${app.login-device.token-expire-minutes:15}")
    private long loginDeviceTokenExpireMinutes;

    @Value("${app.password-reset.verify-base-url:http://localhost:3000/reset-password}")
    private String passwordResetVerifyBaseUrl;

    @Value("${app.password-reset.token-expire-minutes:30}")
    private long passwordResetTokenExpireMinutes;

    @Value("${app.email-change.otp-expire-minutes:10}")
    private long emailChangeOtpExpireMinutes;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        if (id == null) {
            return null;
        }
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User getUserProfile(Long id) {
        if (id == null) {
            return null;
        }
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return null;
        }
        if (user.getUserDetails() != null) {
            user.getUserDetails().getChangeLogs().size();
        }
        return user;
    }

    @Override
    public User getUserByName(String userName) {
        return userRepository.findByUserName(userName);
    }

    @Override
    public User getUserByUsernameOrEmail(String identity) {
        return findUserByIdentity(identity);
    }

    @Override
    public User findByEmail(String email) {
        if (email == null) return null;
        return userRepository.findByEmail(email.toLowerCase());
    }

    @Override
    public User saveUser(User user) {
        user.setActivated(true);
        UserRole role = userRoleRepository.findById(3L).orElse(null);
        if (role == null) {
            role = userRoleRepository.findUserRoleByRoleName("ROLE_USER");
        }
        if (role == null) {
            throw new IllegalStateException("Missing default role ROLE_USER (expected role_id = 3)");
        }
        user.setRole(role);
        user.setPhoneNumber(normalizeVnPhoneOrNull(user.getPhoneNumber()));
        if (user.getEmail() != null) {
            user.setEmail(user.getEmail().trim().toLowerCase());
            if (user.getEmailVerifiedAt() == null) {
                user.setEmailVerifiedAt(LocalDateTime.now());
            }
        }
        if (user.getPhoneNumber() != null && user.getPhoneVerifiedAt() == null) {
            user.setPhoneVerifiedAt(LocalDateTime.now());
        }
        if (user.getMembershipLevel() == null || user.getMembershipLevel().trim().isEmpty()) {
            user.setMembershipLevel("BRONZE");
        }
        if (user.getTotalSpent() == null) {
            user.setTotalSpent(java.math.BigDecimal.ZERO);
        }
        if (user.getCompletedOrdersCount() == null) {
            user.setCompletedOrdersCount(0L);
        }
        adjustMembershipLevel(user);
        if (user.getUserPassword() != null && !user.getUserPassword().isEmpty()) {
            String raw = user.getUserPassword();
            if (!raw.startsWith("$2a$") && !raw.startsWith("$2b$")) {
                user.setUserPassword(passwordEncoder.encode(raw));
            }
        }
        return userRepository.save(user);
    }

    @Override
    public User registerUser(User user) {
        return createPendingRegistration(user);
    }

    @Override
    public User createPendingRegistration(User user) {
        if (user == null) {
            return null;
        }
        user.setRole(null);
        String userName = trimToNull(user.getUserName());
        String email = user.getEmail() != null ? user.getEmail().trim().toLowerCase() : null;
        String phone = normalizeVnPhoneOrNull(user.getPhoneNumber());
        String rawPassword = trimToNull(user.getUserPassword());
        if (userName == null || rawPassword == null) {
            return null;
        }
        if ((email == null || email.isEmpty()) && (phone == null || phone.isEmpty())) {
            return null;
        }
        String identity = email != null && !email.isEmpty() ? email : phone;
        if (userRepository.findByUserName(userName) != null || (email != null && userRepository.findByEmail(email) != null) || (phone != null && userRepository.findByPhoneNumber(phone) != null)) {
            throw new org.springframework.dao.DataIntegrityViolationException("Duplicate registration identity");
        }
        PendingRegistration prev = pendingRegistrations.get(identity);
        if (prev != null && !prev.isExpired()) {
            return null;
        }
        String otp = String.format("%08d", ThreadLocalRandom.current().nextInt(0, 100_000_000));
        PendingRegistration pending = new PendingRegistration(userName, email, phone, rawPassword, otp, LocalDateTime.now().plusMinutes(5));
        pendingRegistrations.put(identity, pending);
        sendPendingRegistrationOtp(identity, otp, userName);
        User response = new User();
        response.setUserName(userName);
        response.setEmail(email);
        response.setPhoneNumber(phone);
        response.setActivated(false);
        return response;
    }

    @Override
    public boolean activateUser(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }
        Optional<UserActivationToken> tokenOpt = userActivationTokenRepository.findByToken(token.trim());
        if (!tokenOpt.isPresent()) {
            return false;
        }
        UserActivationToken activationToken = tokenOpt.get();
        if (activationToken.getUsedAt() != null) {
            return false;
        }
        if (activationToken.getExpiresAt() == null || activationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            User expiredUser = activationToken.getUser();
            Long expiredUserId = expiredUser != null ? expiredUser.getId() : null;
            if (expiredUser != null && expiredUserId != null && !expiredUser.isActivated()) {
                userActivationTokenRepository.deleteAllByUser_Id(expiredUserId);
                userLoginDeviceApprovalTokenRepository.deleteAllByUser_Id(expiredUserId);
                userLoginDeviceRepository.deleteAllByUser_Id(expiredUserId);
                userRepository.deleteById(expiredUserId);
                log.info("Deleted unactivated user {} because activation token expired", expiredUserId);
            } else {
                userActivationTokenRepository.delete(activationToken);
            }
            return false;
        }
        User user = activationToken.getUser();
        if (user == null) {
            return false;
        }
        user.setActivated(true);
        activationToken.setUsedAt(LocalDateTime.now());
        userRepository.save(user);
        userActivationTokenRepository.save(activationToken);
        return true;
    }

    @Override
    public boolean verifyPendingRegistration(String identity, String otp) {
        if (identity == null || identity.trim().isEmpty() || otp == null || otp.trim().isEmpty()) {
            return false;
        }
        String key = normalizePendingIdentity(identity);
        PendingRegistration pending = pendingRegistrations.get(key);
        if (pending == null) {
            return false;
        }
        if (pending.isExpired()) {
            pendingRegistrations.remove(key);
            return false;
        }
        if (!pending.otp.equals(otp.trim())) {
            return false;
        }
        User user = new User();
        user.setUserName(pending.userName);
        user.setEmail(pending.email);
        user.setPhoneNumber(pending.phoneNumber);
        user.setUserPassword(pending.rawPassword);
        User saved = saveUser(user);
        pendingRegistrations.remove(key);
        if (saved != null) {
            try {
                activityLogPublisher.publish(
                        "user-service",
                        "USER_REGISTER",
                        "User",
                        String.valueOf(saved.getId()),
                        "POST",
                        "/registration/verify",
                        UserActivityLogSupport.detailAfterUser(saved),
                        saved.getUserName(),
                        null);
            } catch (Exception ignored) {
            }
        }
        return saved != null;
    }

    @Override
    public String resendPendingRegistrationOtp(String identity) {
        if (identity == null || identity.trim().isEmpty()) {
            return null;
        }
        String key = normalizePendingIdentity(identity);
        PendingRegistration pending = pendingRegistrations.get(key);
        if (pending == null || pending.isExpired()) {
            pendingRegistrations.remove(key);
            return null;
        }

        String recipient = pending.email != null ? pending.email : pending.phoneNumber;
        String newOtp = String.format("%08d", ThreadLocalRandom.current().nextInt(0, 100_000_000));
        pending.refreshOtp(newOtp, LocalDateTime.now().plusMinutes(5));
        pendingRegistrations.put(key, pending);
        sendPendingRegistrationOtp(recipient, newOtp, pending.userName);
        log.info("Resent new registration OTP for identity={}", key);
        return "OTP_SENT";
    }

    @Override
    public boolean verifyActivationOtp(String identity, String otp) {
        if (identity == null || identity.trim().isEmpty() || otp == null || otp.trim().isEmpty()) {
            return false;
        }
        User user = findUserByIdentity(identity.trim());
        if (user == null || user.getId() == null || user.isActivated()) {
            return false;
        }
        Optional<UserActivationToken> tokenOpt = userActivationTokenRepository
                .findTop1ByUser_IdAndOtpCodeAndUsedAtIsNullOrderByIdDesc(user.getId(), otp.trim());
        if (!tokenOpt.isPresent()) {
            return false;
        }
        UserActivationToken activationToken = tokenOpt.get();
        if (activationToken.getExpiresAt() == null || activationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }
        user.setActivated(true);
        activationToken.setUsedAt(LocalDateTime.now());
        userRepository.save(user);
        userActivationTokenRepository.save(activationToken);
        return true;
    }

    @Override
    public String resendActivationOtp(String identity) {
        if (identity == null || identity.trim().isEmpty()) {
            return null;
        }
        User user = findUserByIdentity(identity.trim());
        if (user == null || user.getId() == null || user.isActivated()) {
            return null;
        }
        createActivationTokenAndNotify(user);
        return "OTP_SENT";
    }

    @Override
    public void sendActivationOtp(User user) {
        if (user == null || user.getId() == null || user.isActivated()) {
            return;
        }
        createActivationTokenAndNotify(user);
    }

    @Override
    public Optional<User> authenticate(String username, String password) {
        if (username == null || password == null) {
            return Optional.empty();
        }
        User user = findUserByIdentity(username);
        if (user == null || user.getUserPassword() == null) {
            return Optional.empty();
        }

        // Kiểm tra khóa tài khoản
        if (user.getLockoutEndTime() != null && user.getLockoutEndTime().isAfter(LocalDateTime.now())) {
            if (user.getFailedLoginAttempts() >= 20) {
                throw new IllegalArgumentException("ACCOUNT_LOCKED|Tài khoản của bạn đã bị khóa vĩnh viễn do nhập sai quá nhiều lần. Vui lòng liên hệ Admin để được hỗ trợ.");
            } else {
                long minutes = java.time.Duration.between(LocalDateTime.now(), user.getLockoutEndTime()).toMinutes();
                long seconds = java.time.Duration.between(LocalDateTime.now(), user.getLockoutEndTime()).getSeconds() % 60;
                throw new IllegalArgumentException("ACCOUNT_LOCKED|Tài khoản đang bị tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau " + minutes + " phút " + seconds + " giây.");
            }
        }

        String stored = user.getUserPassword();
        boolean matches;
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
            matches = passwordEncoder.matches(password, stored);
        } else {
            matches = password.equals(stored);
        }

        if (!matches || !user.isActivated()) {
            if (user.isActivated() && !matches) {
                int attempts = user.getFailedLoginAttempts() + 1;
                user.setFailedLoginAttempts(attempts);
                
                if (attempts >= 20) {
                    user.setLockoutEndTime(LocalDateTime.now().plusYears(100)); // Khóa vĩnh viễn
                    userRepository.save(user);
                    throw new IllegalArgumentException("ACCOUNT_LOCKED|Tài khoản của bạn đã bị khóa vĩnh viễn do nhập sai quá 20 lần. Vui lòng liên hệ Admin để được hỗ trợ.");
                } else if (attempts >= 5) {
                    int lockMinutes = (attempts - 4) * 5; // VD: 5 lần -> 5 phút, 6 lần -> 10 phút, ...
                    user.setLockoutEndTime(LocalDateTime.now().plusMinutes(lockMinutes));
                    userRepository.save(user);
                    throw new IllegalArgumentException("ACCOUNT_LOCKED|Bạn đã nhập sai " + attempts + " lần. Tài khoản tạm khóa " + lockMinutes + " phút.");
                }
                userRepository.save(user);
            }
            return Optional.empty();
        }

        // Thành công: Reset số lần sai
        if (user.getFailedLoginAttempts() > 0 || user.getLockoutEndTime() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockoutEndTime(null);
            userRepository.save(user);
        }

        return Optional.of(user);
    }

    @Override
    public boolean unlockUser(Long userId) {
        if (userId == null) return false;
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && (user.getFailedLoginAttempts() > 0 || user.getLockoutEndTime() != null)) {
            user.setFailedLoginAttempts(0);
            user.setLockoutEndTime(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public java.util.List<UserLoginDevice> getUserLoginDevices(Long userId) {
        if (userId == null || userId <= 0) {
            return java.util.Collections.emptyList();
        }
        return userLoginDeviceRepository.findAllByUser_IdOrderByLastSeenAtDesc(userId);
    }

    @Override
    public java.util.List<com.rainbowforest.userservice.entity.UserProfileChangeLog> getUserProfileChangeLogs(Long userId) {
        if (userId == null || userId <= 0) {
            return java.util.Collections.emptyList();
        }
        return userProfileChangeLogRepository.findAllByUserDetails_User_IdOrderByChangedAtDesc(userId);
    }

    @Override
    public UserAddress getUserAddress(Long userId) {
        if (userId == null || userId <= 0) {
            return null;
        }
        return userAddressRepository.findFirstByUserDetails_User_IdAndIsDefaultTrue(userId)
                .orElseGet(() -> {
                    List<UserAddress> all = userAddressRepository.findAllByUserDetails_User_IdOrderByIsDefaultDescIdDesc(userId);
                    return all.isEmpty() ? null : all.get(0);
                });
    }

    @Override
    public List<UserAddress> listUserAddresses(Long userId) {
        if (userId == null || userId <= 0) {
            return java.util.Collections.emptyList();
        }
        return userAddressRepository.findAllByUserDetails_User_IdOrderByIsDefaultDescIdDesc(userId);
    }

    @Override
    public UserAddress createUserAddress(Long userId, UserAddressUpsertRequest request) {
        if (userId == null || userId <= 0) {
            return null;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        UserDetails details = user.getUserDetails();
        if (details == null) {
            return null;
        }
        UserAddress address = new UserAddress();
        address.setUserDetails(details);
        List<UserAddress> existing = userAddressRepository.findAllByUserDetails_IdOrderByIsDefaultDescIdDesc(details.getId());
        address.setIsDefault(existing.isEmpty());
        applyAddress(address, request);
        UserAddress saved = userAddressRepository.save(address);
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                sendAddressChangeNotifications(user, "ADD", saved);
            } catch (Exception e) {
            }
        });
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            return setUserAddressDefault(userId, saved.getId());
        }
        syncUserPhoneFromDefaultAddress(userId);
        return saved;
    }

    @Override
    public UserAddress updateUserAddress(Long userId, Long addressId, UserAddressUpsertRequest request) {
        if (userId == null || userId <= 0) {
            return null;
        }
        if (addressId == null || addressId <= 0) {
            return null;
        }
        UserAddress address = userAddressRepository.findByIdAndUserDetails_User_Id(addressId, userId).orElse(null);
        if (address == null) {
            return null;
        }
        applyAddress(address, request);
        UserAddress saved = userAddressRepository.save(address);
        User owner = address.getUserDetails() != null ? address.getUserDetails().getUser() : null;
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                sendAddressChangeNotifications(owner, "UPDATE", saved);
            } catch (Exception e) {
            }
        });
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            return setUserAddressDefault(userId, saved.getId());
        }
        syncUserPhoneFromDefaultAddress(userId);
        return saved;
    }

    @Override
    public UserAddress setUserAddressDefault(Long userId, Long addressId) {
        if (userId == null || userId <= 0 || addressId == null || addressId <= 0) {
            return null;
        }
        List<UserAddress> all = userAddressRepository.findAllByUserDetails_User_IdOrderByIsDefaultDescIdDesc(userId);
        if (all.isEmpty()) {
            return null;
        }
        UserAddress target = null;
        for (UserAddress a : all) {
            boolean isTarget = a != null && addressId.equals(a.getId());
            if (a != null) {
                a.setIsDefault(isTarget);
                userAddressRepository.save(a);
            }
            if (isTarget) {
                target = a;
            }
        }
        syncUserPhoneFromDefaultAddress(userId);
        return target;
    }

    @Override
    public boolean deleteUserAddress(Long userId, Long addressId) {
        if (userId == null || userId <= 0) {
            return false;
        }
        if (addressId == null || addressId <= 0) {
            return false;
        }
        UserAddress row = userAddressRepository.findByIdAndUserDetails_User_Id(addressId, userId).orElse(null);
        if (row == null) {
            return false;
        }
        User owner = row.getUserDetails() != null ? row.getUserDetails().getUser() : null;
        String deletedAddressText = composeAddressText(row);
        boolean wasDefault = Boolean.TRUE.equals(row.getIsDefault());
        userAddressRepository.deleteByIdAndUserDetails_User_Id(addressId, userId);
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                sendAddressChangeNotifications(owner, "DELETE", deletedAddressText);
            } catch (Exception e) {
            }
        });
        if (wasDefault) {
            List<UserAddress> remaining = userAddressRepository.findAllByUserDetails_User_IdOrderByIsDefaultDescIdDesc(userId);
            if (!remaining.isEmpty()) {
                UserAddress next = remaining.get(0);
                next.setIsDefault(true);
                userAddressRepository.save(next);
            }
        }
        syncUserPhoneFromDefaultAddress(userId);
        return true;
    }

    @Override
    public boolean isLoginDeviceApproved(User user, String deviceFingerprint) {
        if (user == null || user.getId() == null || deviceFingerprint == null || deviceFingerprint.trim().isEmpty()) {
            return false;
        }
        return userLoginDeviceRepository.findByUser_IdAndDeviceFingerprint(user.getId(), deviceFingerprint.trim()).isPresent();
    }

    @Override
    public void markLoginDeviceSeen(User user, String deviceFingerprint, String deviceLabel, String ipAddress, String location, String timeZone, String locale) {
        if (user == null || user.getId() == null || deviceFingerprint == null || deviceFingerprint.trim().isEmpty()) {
            return;
        }
        String fp = deviceFingerprint.trim();
        UserLoginDevice device = userLoginDeviceRepository.findByUser_IdAndDeviceFingerprint(user.getId(), fp).orElseGet(UserLoginDevice::new);
        device.setUser(user);
        device.setDeviceFingerprint(fp);
        if (deviceLabel != null && !deviceLabel.trim().isEmpty()) {
            device.setDeviceLabel(deviceLabel.trim());
        }
        device.setLastLoginIp(trimToNull(ipAddress));
        device.setLastLoginLocation(trimToNull(location));
        device.setLastLoginTimezone(trimToNull(timeZone));
        device.setLastLoginLocale(trimToNull(locale));
        device.setLastSeenAt(LocalDateTime.now());
        userLoginDeviceRepository.save(device);
    }

    @Override
    public void requestLoginDeviceApproval(User user, String deviceFingerprint, String deviceLabel, String ipAddress, String location, String timeZone, String locale) {
        if (user == null || user.getId() == null || user.getEmail() == null) {
            return;
        }
        String fp = deviceFingerprint != null ? deviceFingerprint.trim() : "";
        if (fp.isEmpty()) {
            return;
        }
        Optional<UserLoginDeviceApprovalToken> existing
                = userLoginDeviceApprovalTokenRepository.findTop1ByUser_IdAndDeviceFingerprintAndUsedAtIsNullOrderByIdDesc(user.getId(), fp);
        if (existing.isPresent()) {
            UserLoginDeviceApprovalToken old = existing.get();
            if (old.getExpiresAt() != null && old.getExpiresAt().isAfter(LocalDateTime.now())) {
                old.setOtpCode(String.format("%08d", ThreadLocalRandom.current().nextInt(0, 100_000_000)));
                old.setDeviceLabel(deviceLabel != null ? deviceLabel.trim() : null);
                old.setIpAddress(trimToNull(ipAddress));
                old.setLocationLabel(trimToNull(location));
                old.setTimezoneLabel(trimToNull(timeZone));
                old.setLocaleLabel(trimToNull(locale));
                old.setToken(UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", ""));
                old.setExpiresAt(LocalDateTime.now().plusMinutes(Math.max(5, loginDeviceTokenExpireMinutes)));
                userLoginDeviceApprovalTokenRepository.save(old);
                sendLoginDeviceApprovalEmail(user, old);
                return;
            }
        }
        UserLoginDeviceApprovalToken approvalToken = new UserLoginDeviceApprovalToken();
        approvalToken.setUser(user);
        approvalToken.setDeviceFingerprint(fp);
        approvalToken.setDeviceLabel(deviceLabel != null ? deviceLabel.trim() : null);
        approvalToken.setOtpCode(String.format("%08d", ThreadLocalRandom.current().nextInt(0, 100_000_000)));
        approvalToken.setIpAddress(trimToNull(ipAddress));
        approvalToken.setLocationLabel(trimToNull(location));
        approvalToken.setTimezoneLabel(trimToNull(timeZone));
        approvalToken.setLocaleLabel(trimToNull(locale));
        approvalToken.setToken(UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", ""));
        approvalToken.setExpiresAt(LocalDateTime.now().plusMinutes(Math.max(5, loginDeviceTokenExpireMinutes)));
        userLoginDeviceApprovalTokenRepository.save(approvalToken);
        sendLoginDeviceApprovalEmail(user, approvalToken);
    }

    @Override
    public User approveLoginDevice(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }
        Optional<UserLoginDeviceApprovalToken> tokenOpt = userLoginDeviceApprovalTokenRepository.findByToken(token.trim());
        if (!tokenOpt.isPresent()) {
            return null;
        }
        UserLoginDeviceApprovalToken approvalToken = tokenOpt.get();
        if (approvalToken.getUsedAt() != null) {
            return null;
        }
        if (approvalToken.getExpiresAt() == null || approvalToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return null;
        }
        User user = approvalToken.getUser();
        if (user == null || user.getId() == null || !user.isActivated()) {
            return null;
        }
        markLoginDeviceSeen(
                user,
                approvalToken.getDeviceFingerprint(),
                approvalToken.getDeviceLabel(),
                approvalToken.getIpAddress(),
                approvalToken.getLocationLabel(),
                approvalToken.getTimezoneLabel(),
                approvalToken.getLocaleLabel());
        approvalToken.setUsedAt(LocalDateTime.now());
        userLoginDeviceApprovalTokenRepository.save(approvalToken);
        return user;
    }

    @Override
    public User verifyLoginOtp(String identity, String otp, String deviceFingerprint) {
        User user = findUserByIdentity(identity);
        if (user == null || user.getId() == null || !user.isActivated()) {
            return null;
        }
        if (otp == null || otp.trim().isEmpty() || deviceFingerprint == null || deviceFingerprint.trim().isEmpty()) {
            return null;
        }
        Optional<UserLoginDeviceApprovalToken> tokenOpt
                = userLoginDeviceApprovalTokenRepository.findTop1ByUser_IdAndOtpCodeAndUsedAtIsNullOrderByIdDesc(
                        user.getId(), otp.trim());
        if (!tokenOpt.isPresent()) {
            return null;
        }
        UserLoginDeviceApprovalToken approvalToken = tokenOpt.get();
        if (approvalToken.getExpiresAt() == null || approvalToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return null;
        }
        if (deviceFingerprint != null && !deviceFingerprint.trim().isEmpty() && approvalToken.getDeviceFingerprint() != null
                && !approvalToken.getDeviceFingerprint().trim().equals(deviceFingerprint.trim())) {
            log.warn("Login OTP fingerprint mismatch for userId={}, tokenFingerprint={}, requestFingerprint={}",
                    user.getId(), approvalToken.getDeviceFingerprint(), deviceFingerprint.trim());
        }
        markLoginDeviceSeen(
                user,
                approvalToken.getDeviceFingerprint() != null && !approvalToken.getDeviceFingerprint().trim().isEmpty()
                ? approvalToken.getDeviceFingerprint()
                : deviceFingerprint.trim(),
                approvalToken.getDeviceLabel(),
                approvalToken.getIpAddress(),
                approvalToken.getLocationLabel(),
                approvalToken.getTimezoneLabel(),
                approvalToken.getLocaleLabel());
        approvalToken.setUsedAt(LocalDateTime.now());
        userLoginDeviceApprovalTokenRepository.save(approvalToken);
        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginIp(approvalToken.getIpAddress());
        user.setLastLoginDeviceFingerprint(approvalToken.getDeviceFingerprint());
        userRepository.save(user);
        return user;
    }

    @Override
    public String resendLoginOtp(String identity, String deviceFingerprint) {
        User user = findUserByIdentity(identity);
        if (user == null || user.getId() == null || !user.isActivated() || deviceFingerprint == null || deviceFingerprint.trim().isEmpty()) {
            return null;
        }
        Optional<UserLoginDeviceApprovalToken> existing
                = userLoginDeviceApprovalTokenRepository.findTop1ByUser_IdAndDeviceFingerprintAndUsedAtIsNullOrderByIdDesc(
                        user.getId(), deviceFingerprint.trim());
        if (!existing.isPresent()) {
            return null;
        }
        UserLoginDeviceApprovalToken token = existing.get();
        token.setOtpCode(String.format("%08d", ThreadLocalRandom.current().nextInt(0, 100_000_000)));
        token.setToken(UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", ""));
        token.setExpiresAt(LocalDateTime.now().plusMinutes(Math.max(5, loginDeviceTokenExpireMinutes)));
        userLoginDeviceApprovalTokenRepository.save(token);
        sendLoginDeviceApprovalEmail(user, token);
        return "OTP_SENT";
    }

    @Override
    public void requestPasswordReset(String identity) {
        User user = findUserByIdentity(identity);
        if (user == null || user.getId() == null || user.getEmail() == null || !user.isActivated()) {
            return;
        }
        String email = user.getEmail().trim();
        if (email.isEmpty()) {
            return;
        }

        userPasswordResetTokenRepository.deleteAllByUser_Id(user.getId());
        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        UserPasswordResetToken resetToken = new UserPasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(token);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(Math.max(5, passwordResetTokenExpireMinutes)));
        userPasswordResetTokenRepository.save(resetToken);

        sendPasswordResetEmail(user, token);
    }

    @Override
    public boolean resetPassword(String token, String newPassword) {
        if (token == null || token.trim().isEmpty() || newPassword == null || newPassword.trim().length() < 8) {
            return false;
        }
        Optional<UserPasswordResetToken> tokenOpt = userPasswordResetTokenRepository.findByToken(token.trim());
        if (!tokenOpt.isPresent()) {
            return false;
        }
        UserPasswordResetToken resetToken = tokenOpt.get();
        if (resetToken.getUsedAt() != null) {
            return false;
        }
        if (resetToken.getExpiresAt() == null || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }
        User user = resetToken.getUser();
        if (user == null || user.getId() == null || !user.isActivated()) {
            return false;
        }
        user.setUserPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);
        resetToken.setUsedAt(LocalDateTime.now());
        userPasswordResetTokenRepository.save(resetToken);
        return true;
    }

    private User findUserByIdentity(String identity) {
        if (identity == null) {
            return null;
        }
        String v = identity.trim();
        if (v.isEmpty()) {
            return null;
        }
        if (v.contains("@")) {
            User active = userRepository.findFirstByEmailAndActivatedTrue(v.toLowerCase());
            return active != null ? active : userRepository.findByEmail(v.toLowerCase());
        }
        User byPhone = findByPhoneIdentity(v);
        if (byPhone != null) {
            return byPhone;
        }
        User active = userRepository.findFirstByUserNameAndActivatedTrue(v);
        return active != null ? active : userRepository.findByUserName(v);
    }

    private String normalizePendingIdentity(String identity) {
        if (identity == null) {
            return null;
        }
        String v = identity.trim();
        if (v.isEmpty()) {
            return null;
        }
        if (v.contains("@")) {
            return v.toLowerCase();
        }
        String phone = normalizeVnPhoneOrNull(v);
        return phone != null ? phone : v;
    }

    private User findByPhoneIdentity(String raw) {
        String v = raw.trim();
        if (v.isEmpty()) {
            return null;
        }
        User activeDirect = userRepository.findFirstByPhoneNumberAndActivatedTrue(v);
        if (activeDirect != null) {
            return activeDirect;
        }
        User direct = userRepository.findByPhoneNumber(v);
        if (direct != null) {
            return direct;
        }
        String digits = v.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) {
            return null;
        }
        User activeByDigits = userRepository.findFirstByPhoneNumberAndActivatedTrue(digits);
        if (activeByDigits != null) {
            return activeByDigits;
        }
        User byDigits = userRepository.findByPhoneNumber(digits);
        if (byDigits != null) {
            return byDigits;
        }
        if (digits.startsWith("84")) {
            User activeWithZero = userRepository.findFirstByPhoneNumberAndActivatedTrue("0" + digits.substring(2));
            if (activeWithZero != null) {
                return activeWithZero;
            }
            User withZero = userRepository.findByPhoneNumber("0" + digits.substring(2));
            if (withZero != null) {
                return withZero;
            }
        } else if (digits.startsWith("0") && digits.length() > 1) {
            User activeWith84 = userRepository.findFirstByPhoneNumberAndActivatedTrue("84" + digits.substring(1));
            if (activeWith84 != null) {
                return activeWith84;
            }
            User with84 = userRepository.findByPhoneNumber("84" + digits.substring(1));
            if (with84 != null) {
                return with84;
            }
        }
        return null;
    }

    @Override
    public User updateProfile(Long userId, UserProfileUpdateRequest request) {
        if (userId == null || userId <= 0 || request == null) {
            return null;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }

        UserDetails details = ensureUserDetails(user);
        if (details.getId() == null) {
            user = userRepository.save(user);
            details = user.getUserDetails();
        }

        String nextFirstName = request.getFirstName() != null ? trimToNull(request.getFirstName()) : trimToNull(details.getFirstName());
        String nextLastName = request.getLastName() != null ? trimToNull(request.getLastName()) : trimToNull(details.getLastName());
        String nextGender = request.getGender() != null ? trimToNull(request.getGender()) : trimToNull(details.getGender());

        if (nextFirstName == null) {
            nextFirstName = "User";
        }
        if (nextLastName == null) {
            nextLastName = "User";
        }

        logChange(details, "firstName", details.getFirstName(), nextFirstName, request.getPerformedBy());
        logChange(details, "lastName", details.getLastName(), nextLastName, request.getPerformedBy());
        logChange(details, "phoneNumber", user.getPhoneNumber(), request.getPhoneNumber(), request.getPerformedBy());
        logChange(details, "gender", details.getGender(), nextGender, request.getPerformedBy());
        logChange(details, "birthDate",
                details.getBirthDate() != null ? details.getBirthDate().toString() : null,
                request.getBirthDate(),
                request.getPerformedBy()
        );

        details.setFirstName(nextFirstName);
        details.setLastName(nextLastName);
        details.setGender(nextGender);

        if (request.getBirthDate() != null && !request.getBirthDate().trim().isEmpty()) {
            try {
                details.setBirthDate(java.time.LocalDate.parse(request.getBirthDate().trim()));
            } catch (Exception ignored) {
            }
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(normalizeVnPhoneOrNull(request.getPhoneNumber()));
        }

        if (request.getPerformedBy() != null && !request.getPerformedBy().trim().isEmpty()) {
            user.setUpdatedBy(request.getPerformedBy().trim());
        }

        userRepository.save(user);

        return user;
    }

    @Override
    public User updateUserRole(Long userId, UserRoleUpdateRequest request) {
        if (userId == null || userId <= 0 || request == null) {
            return null;
        }
        String roleName = trimToNull(request.getRoleName());
        if (roleName == null) {
            return null;
        }
        String normalizedRole = roleName.toUpperCase();
        if (!normalizedRole.startsWith("ROLE_")) {
            normalizedRole = "ROLE_" + normalizedRole;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        UserRole role = userRoleRepository.findUserRoleByRoleName(normalizedRole);
        if (role == null) {
            return null;
        }
        user.setRole(role);
        if (request.getPerformedBy() != null && !request.getPerformedBy().trim().isEmpty()) {
            user.setUpdatedBy(request.getPerformedBy().trim());
        }
        return userRepository.save(user);
    }

    @Override
    public User updateAvatar(Long userId, String avatarUrl, String performedBy) {
        if (userId == null || userId <= 0) {
            return null;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        UserDetails details = ensureUserDetails(user);
        String nextAvatar = trimToNull(avatarUrl);
        logChange(details, "avatarUrl", details.getAvatarUrl(), nextAvatar, performedBy);
        details.setAvatarUrl(nextAvatar);
        if (performedBy != null && !performedBy.trim().isEmpty()) {
            user.setUpdatedBy(performedBy.trim());
        }
        return userRepository.save(user);
    }

    @Override
    public String requestEmailChangeOtp(Long userId, EmailOtpRequest request) {
        if (userId == null || userId <= 0 || request == null) {
            return null;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }

        String oldEmail = user.getEmail() != null && !user.getEmail().trim().isEmpty()
                ? user.getEmail().trim().toLowerCase()
                : (request.getOldEmail() != null && !request.getOldEmail().trim().isEmpty()
                    ? request.getOldEmail().trim().toLowerCase()
                    : null);

        if (oldEmail == null || !oldEmail.contains("@")) {
            return null;
        }

        String newEmail = request.getNewEmail() != null && !request.getNewEmail().trim().isEmpty() ? request.getNewEmail().trim().toLowerCase() : null;
        if (newEmail != null && newEmail.equals(oldEmail)) {
            newEmail = null;
        }

        String recipientEmail = oldEmail;
        if (newEmail != null && !newEmail.isEmpty() && newEmail.contains("@")) {
            recipientEmail = newEmail;
        }

        String otp = String.format("%08d", ThreadLocalRandom.current().nextInt(0, 100_000_000));
        PendingEmailChange existing = pendingEmailChanges.get(userId);
        if (existing != null && !existing.isExpired() && !existing.canResendNow(false)) {
            boolean isTransitionToNewEmail = existing.newEmail == null && newEmail != null && !newEmail.isEmpty() && newEmail.contains("@") && !newEmail.equals(oldEmail);
            if (!isTransitionToNewEmail && existing.newEmail != null) {
                // If the user requests OTP again within 60s for the same step (e.g. they closed and reopened the dialog),
                // we gracefully return success so the UI doesn't crash, but we DO NOT send another email to prevent spam.
                return "OTP_SENT";
            }
        }

        boolean oldVerified = existing != null && existing.oldEmailVerified;

        PendingEmailChange pending = new PendingEmailChange(
                oldEmail,
                newEmail,
                otp,
                LocalDateTime.now().plusMinutes(Math.max(2, emailChangeOtpExpireMinutes))
        );
        pending.oldEmailVerified = oldVerified;

        pendingEmailChanges.put(userId, pending);
        sendOtpEmail(recipientEmail, otp, user);
        return "OTP_SENT";
    }

    @Override
    public String resendEmailChangeOtp(Long userId, EmailOtpRequest request) {
        if (userId == null || userId <= 0) {
            return null;
        }
        PendingEmailChange pending = pendingEmailChanges.get(userId);
        if (pending == null || pending.isExpired()) {
            pendingEmailChanges.remove(userId);
            return null;
        }
        if (!pending.canResendNow(pending.newEmail == null)) {
            return "OTP_SENT";
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        String oldEmail = pending.oldEmail;
        String otp = String.format("%08d", ThreadLocalRandom.current().nextInt(0, 100_000_000));
        PendingEmailChange next = new PendingEmailChange(
                oldEmail,
                pending.newEmail,
                otp,
                LocalDateTime.now().plusMinutes(Math.max(2, emailChangeOtpExpireMinutes))
        );
        pendingEmailChanges.put(userId, next);
        // resend the email associated with the current step; for step-1 this is the old email,
        // for step-2 the pending.newEmail is already populated by confirmEmailChangeStart.
        String recipient = (pending.newEmail != null && !pending.newEmail.trim().isEmpty())
                ? pending.newEmail.trim().toLowerCase()
                : oldEmail;
        sendOtpEmail(recipient, otp, user);
        return "OTP_SENT";
    }

    @Override
    public boolean verifyEmailChangeOtp(Long userId, VerifyEmailOtpRequest request) {
        if (userId == null || userId <= 0 || request == null || request.getOtp() == null) {
            return false;
        }
        PendingEmailChange pending = pendingEmailChanges.get(userId);
        if (pending == null) {
            return false;
        }
        if (pending.isExpired()) {
            pendingEmailChanges.remove(userId);
            return false;
        }
        if (!pending.canAttemptVerify()) {
            return false;
        }
        if (pending.oldEmailVerified) {
            return false;
        }
        String submittedOtp = request.getOtp().trim();
        if (!pending.otp.equals(submittedOtp)) {
            pending.markFailedAttempt();
            return false;
        }
        // OTP correct; keep pending so user can submit newEmail in confirm step.
        pending.oldEmailVerified = true;
        return true;
    }

    @Override
    public User confirmEmailChange(Long userId, VerifyEmailOtpRequest request) {
        if (userId == null || userId <= 0 || request == null || request.getOtp() == null) {
            return null;
        }
        PendingEmailChange pending = pendingEmailChanges.get(userId);
        if (pending == null) {
            return null;
        }
        if (pending.isExpired()) {
            pendingEmailChanges.remove(userId);
            return null;
        }
        if (!pending.canAttemptVerify()) {
            return null;
        }
        String submittedNewEmail = request.getNewEmail() != null ? request.getNewEmail().trim().toLowerCase() : "";
        if (submittedNewEmail.isEmpty() || !submittedNewEmail.contains("@")) {
            return null;
        }
        String submittedOtp = request.getOtp().trim();
        if (!pending.otp.equals(submittedOtp)) {
            pending.markFailedAttempt();
            return null;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        // Ensure we have UserDetails so we can persist profile change logs.
        UserDetails details = user.getUserDetails();
        if (details == null) {
            details = new UserDetails();
            user.setUserDetails(details);
            details.setUser(user);
        }
        String newEmail = submittedNewEmail;
        String oldEmail = pending.oldEmail;
        if (newEmail == null || newEmail.isEmpty()) {
            return null;
        }
        if (newEmail.equals(oldEmail)) {
            return null;
        }
        User existingUser = userRepository.findByEmail(newEmail);
        if (existingUser != null && existingUser.getId() != null && !existingUser.getId().equals(userId)) {
            return null;
        }
        // Ensure user's current email still matches the one we sent OTP to.
        if (user.getEmail() == null || !user.getEmail().trim().toLowerCase().equals(oldEmail)) {
            pendingEmailChanges.remove(userId);
            return null;
        }
        logChange(details, "email", oldEmail, newEmail, request.getPerformedBy());
        user.setEmail(newEmail);
        if (request.getPerformedBy() != null && !request.getPerformedBy().trim().isEmpty()) {
            user.setUpdatedBy(request.getPerformedBy().trim());
        }
        User saved = userRepository.save(user);
        sendEmailChangedNotice(oldEmail, newEmail, user);
        pendingEmailChanges.remove(userId);
        return saved;
    }

    @Override
    public boolean changePassword(Long userId, PasswordChangeRequest request) {
        if (userId == null || userId <= 0 || request == null || request.getNewPassword() == null) {
            return false;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getUserPassword() == null || request.getCurrentPassword() == null) {
            return false;
        }
        String currentRaw = request.getCurrentPassword().trim();
        String newRaw = request.getNewPassword().trim();
        if (currentRaw.isEmpty() || newRaw.length() < 8) {
            return false;
        }
        String stored = user.getUserPassword();
        boolean currentMatches;
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
            currentMatches = passwordEncoder.matches(currentRaw, stored);
        } else {
            // Backward compatibility for legacy plaintext rows.
            currentMatches = currentRaw.equals(stored);
        }
        if (!currentMatches) {
            return false;
        }
        if (currentRaw.equals(newRaw)) {
            return false;
        }
        user.setUserPassword(passwordEncoder.encode(newRaw));
        user.setPasswordChangedAt(LocalDateTime.now());
        if (request.getPerformedBy() != null && !request.getPerformedBy().trim().isEmpty()) {
            user.setUpdatedBy(request.getPerformedBy().trim());
        }
        logChange(ensureUserDetails(user), "password", "[PROTECTED]", "[UPDATED]", request.getPerformedBy());
        userRepository.save(user);
        sendPasswordChangedNotice(user, request.getPerformedBy());
        return true;
    }

    @Override
    public boolean verifyPassword(Long userId, String password) {
        if (userId == null || userId <= 0 || password == null) {
            return false;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getUserPassword() == null) {
            return false;
        }
        String stored = user.getUserPassword();
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
            return passwordEncoder.matches(password.trim(), stored);
        }
        return password.trim().equals(stored);
    }

    private void logChange(UserDetails details, String field, String oldVal, String newVal, String changedBy) {
        if (details == null) {
            return;
        }
        String o = oldVal == null ? null : oldVal.trim();
        String n = newVal == null ? null : newVal.trim();
        if (java.util.Objects.equals(o, n)) {
            return;
        }
        if (details.getId() == null) {
            return;
        }
        com.rainbowforest.userservice.entity.UserProfileChangeLog log = new com.rainbowforest.userservice.entity.UserProfileChangeLog();
        log.setUserDetails(details);
        log.setChangedField(field);
        log.setOldValue(o);
        log.setNewValue(n);
        log.setChangedAt(java.time.LocalDateTime.now());
        log.setChangedBy(changedBy);
        userProfileChangeLogRepository.save(log);
    }

    private UserDetails ensureUserDetails(User user) {
        UserDetails details = user != null ? user.getUserDetails() : null;
        if (details != null) {
            if (details.getUser() == null) {
                details.setUser(user);
            }
            return details;
        }
        details = new UserDetails();
        details.setUser(user);
        String fallback = user != null && user.getUserName() != null && !user.getUserName().trim().isEmpty()
                ? user.getUserName().trim()
                : "User";
        details.setFirstName(fallback.length() > 50 ? fallback.substring(0, 50) : fallback);
        details.setLastName("User");
        if (user != null) {
            user.setUserDetails(details);
        }
        return details;
    }

    private void sendPendingRegistrationOtp(String recipientEmail, String otp, String username) {
        if (recipientEmail == null || recipientEmail.trim().isEmpty() || otp == null || otp.trim().isEmpty()) {
            return;
        }
        String sendUrl = notificationSendUrl != null ? notificationSendUrl.trim() : "";
        if (sendUrl.isEmpty()) {
            return;
        }
        String who = username != null && !username.trim().isEmpty() ? username.trim() : "ban";
        String htmlBody
                = "<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>" + escapeHtml(who) + "</strong>,</p>"
                + "<p style=\"margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#475569;\">Mã OTP đăng ký tài khoản của bạn là:</p>"
                + "<div style=\"text-align:center;margin:32px 0;\">"
                + "  <span style=\"display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;font-size:32px;font-weight:900;letter-spacing:12px;padding:16px 24px;border-radius:16px;\">" + escapeHtml(otp) + "</span>"
                + "</div>"
                + "<p style=\"margin:0;font-size:13px;line-height:1.6;color:#64748b;text-align:center;\">Mã OTP chỉ có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này.</p>";
        postNotification("EMAIL", recipientEmail.trim().toLowerCase(), "Ma OTP dang ky tai khoan", htmlBody, true);
    }

    private void sendOtpEmail(String recipientEmail, String otp, User user) {
        if (recipientEmail == null || recipientEmail.trim().isEmpty() || otp == null) {
            return;
        }
        String sendUrl = notificationSendUrl != null ? notificationSendUrl.trim() : "";
        if (sendUrl.isEmpty()) {
            return;
        }
        String username = user != null && user.getUserName() != null ? user.getUserName() : "ban";
        String htmlBody
                = "<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>" + escapeHtml(username) + "</strong>,</p>"
                + "<p style=\"margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#475569;\">Bạn vừa yêu cầu thay đổi địa chỉ email. Mã OTP của bạn là:</p>"
                + "<div style=\"text-align:center;margin:32px 0;\">"
                + "  <span style=\"display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;font-size:32px;font-weight:900;letter-spacing:12px;padding:16px 24px;border-radius:16px;\">" + escapeHtml(otp) + "</span>"
                + "</div>"
                + "<p style=\"margin:0;font-size:13px;line-height:1.6;color:#64748b;text-align:center;\">Mã này chỉ có hiệu lực trong thời gian ngắn. Nếu không phải bạn, hãy bỏ qua email này.</p>";
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/json;charset=UTF-8"));
            String json = "{"
                    + "\"channel\":\"EMAIL\","
                    + "\"recipient\":\"" + recipientEmail.trim().replace("\\", "\\\\").replace("\"", "\\\"") + "\","
                    + "\"subject\":\"Ma OTP doi Gmail\","
                    + "\"body\":\"" + htmlBody.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + "\","
                    + "\"html\":true"
                    + "}";
            restTemplate.postForEntity(sendUrl, new HttpEntity<String>(json, headers), String.class);
        } catch (Exception e) {
            log.warn("Failed to send OTP email to {}: {}", recipientEmail, String.valueOf(e.getMessage()));
        }
    }

    private void sendEmailChangedNotice(String oldEmail, String newEmail, User user) {
        if (oldEmail == null || newEmail == null || user == null) {
            return;
        }
        String sendUrl = notificationSendUrl != null ? notificationSendUrl.trim() : "";
        if (sendUrl.isEmpty()) {
            return;
        }
        String username = user.getUserName() != null ? user.getUserName() : "ban";
        String htmlBody
                = "<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>" + escapeHtml(username) + "</strong>,</p>"
                + "<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#475569;\">Địa chỉ email liên kết với tài khoản của bạn đã được thay đổi thành công.</p>"
                + "<div style=\"background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:24px 0;\">"
                + "  <p style=\"margin:0 0 8px 0;font-size:14px;color:#64748b;\">Email cũ: <strong style=\"color:#0f172a;\">" + escapeHtml(oldEmail) + "</strong></p>"
                + "  <p style=\"margin:0;font-size:14px;color:#64748b;\">Email mới: <strong style=\"color:#0f172a;\">" + escapeHtml(newEmail) + "</strong></p>"
                + "</div>"
                + "<p style=\"margin:0;font-size:13px;line-height:1.6;color:#ef4444;\">Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ admin và đổi mật khẩu ngay lập tức!</p>";
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/json;charset=UTF-8"));
            String json = "{"
                    + "\"channel\":\"EMAIL\","
                    + "\"recipient\":\"" + oldEmail.trim().replace("\\", "\\\\").replace("\"", "\\\"") + "\","
                    + "\"subject\":\"Thong bao thay doi Gmail\","
                    + "\"body\":\"" + htmlBody.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + "\","
                    + "\"html\":true"
                    + "}";
            restTemplate.postForEntity(sendUrl, new HttpEntity<String>(json, headers), String.class);
        } catch (Exception e) {
            log.warn("Failed to send email-changed notice to {}: {}", oldEmail, String.valueOf(e.getMessage()));
        }
    }

    private void sendPasswordChangedNotice(User user, String performedBy) {
        if (user == null || user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            return;
        }
        String sendUrl = notificationSendUrl != null ? notificationSendUrl.trim() : "";
        if (sendUrl.isEmpty()) {
            return;
        }
        String recipient = user.getEmail().trim().toLowerCase();
        String username = user.getUserName() != null ? user.getUserName() : "ban";
        String changedBy = performedBy != null && !performedBy.trim().isEmpty() ? performedBy.trim() : username;
        String htmlBody
                = "<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>" + escapeHtml(username) + "</strong>,</p>"
                + "<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#475569;\">Mật khẩu tài khoản của bạn vừa được cập nhật thành công.</p>"
                + "<div style=\"background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:24px 0;\">"
                + "  <p style=\"margin:0;font-size:14px;color:#64748b;\">Thực hiện bởi: <strong style=\"color:#0f172a;\">" + escapeHtml(changedBy) + "</strong></p>"
                + "</div>"
                + "<p style=\"margin:0;font-size:13px;line-height:1.6;color:#ef4444;\">Nếu bạn không thực hiện thay đổi này, tài khoản của bạn có thể đang gặp rủi ro. Vui lòng liên hệ hỗ trợ ngay lập tức!</p>";
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/json;charset=UTF-8"));
            String json = "{"
                    + "\"channel\":\"EMAIL\"," 
                    + "\"recipient\":\"" + recipient.replace("\\", "\\\\").replace("\"", "\\\"") + "\"," 
                    + "\"subject\":\"Thong bao thay doi mat khau\"," 
                    + "\"body\":\"" + htmlBody.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + "\"," 
                    + "\"html\":true" 
                    + "}";
            restTemplate.postForEntity(sendUrl, new HttpEntity<String>(json, headers), String.class);
        } catch (Exception e) {
            log.warn("Failed to send password-changed notice to {}: {}", recipient, String.valueOf(e.getMessage()));
        }
    }

    private static final class PendingRegistration {

        private final String userName;
        private final String email;
        private final String phoneNumber;
        private final String rawPassword;
        private String otp;
        private LocalDateTime expiresAt;

        private PendingRegistration(String userName, String email, String phoneNumber, String rawPassword, String otp, LocalDateTime expiresAt) {
            this.userName = userName;
            this.email = email;
            this.phoneNumber = phoneNumber;
            this.rawPassword = rawPassword;
            this.otp = otp;
            this.expiresAt = expiresAt;
        }

        private void refreshOtp(String otp, LocalDateTime expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }

        private boolean isExpired() {
            return expiresAt == null || expiresAt.isBefore(LocalDateTime.now());
        }
    }

    private static final class PendingEmailChange {

        private final String oldEmail;
        private String newEmail;
        private final String otp;
        private final LocalDateTime expiresAt;
        private final LocalDateTime createdAt;
        private final LocalDateTime lastSentAt;
        private int failedAttempts;
        private boolean oldEmailVerified;

        private PendingEmailChange(String oldEmail, String newEmail, String otp, LocalDateTime expiresAt) {
            this.oldEmail = oldEmail;
            this.newEmail = newEmail;
            this.otp = otp;
            this.expiresAt = expiresAt;
            this.createdAt = LocalDateTime.now();
            this.lastSentAt = this.createdAt;
            this.failedAttempts = 0;
            this.oldEmailVerified = false;
        }

        private boolean isExpired() {
            return expiresAt == null || expiresAt.isBefore(LocalDateTime.now());
        }

        private boolean canResendNow(boolean isOldEmail) {
            if (isOldEmail) return true; // No cooldown for old email
            // Minimum 60 seconds between resends for this user.
            return lastSentAt == null || lastSentAt.plusSeconds(60).isBefore(LocalDateTime.now());
        }

        private boolean canAttemptVerify() {
            return failedAttempts < 1;
        }

        private void markFailedAttempt() {
            failedAttempts++;
        }
    }

    private void applyAddress(UserAddress address, UserAddressUpsertRequest request) {
        if (address == null || request == null) {
            return;
        }
        address.setRecipientName(trimToNull(request.getRecipientName()));
        address.setProvinceCode(trimToNull(request.getProvinceCode()));
        address.setProvinceName(trimToNull(request.getProvinceName()));
        address.setWardCode(trimToNull(request.getWardCode()));
        address.setWardName(trimToNull(request.getWardName()));
        address.setStreetLine(trimToNull(request.getStreetLine()));
        address.setFullAddress(trimToNull(request.getFullAddress()));
        address.setPhoneNumber(normalizeVnPhoneOrNull(request.getPhoneNumber()));
    }

    /**
     * Ghi SĐT tài khoản = SĐT địa chỉ mặc định (đặt đơn / MVD).
     */
    private void syncUserPhoneFromDefaultAddress(Long userId) {
        if (userId == null || userId <= 0) {
            return;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return;
        }
        UserAddress def = userAddressRepository.findFirstByUserDetails_User_IdAndIsDefaultTrue(userId).orElse(null);
        String fromAddr = def != null ? normalizeVnPhoneOrNull(def.getPhoneNumber()) : null;
        if (fromAddr != null) {
            user.setPhoneNumber(fromAddr);
            userRepository.save(user);
        }
    }

    private String normalizeVnPhoneOrNull(String raw) {
        if (raw == null) {
            return null;
        }
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) {
            return null;
        }
        if (digits.startsWith("84") && digits.length() == 11) {
            return digits;
        }
        if (digits.startsWith("0") && digits.length() == 10) {
            return digits;
        }
        return null;
    }

    private String trimToNull(String v) {
        if (v == null) {
            return null;
        }
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }

    private void adjustMembershipLevel(User user) {
        if (user == null) {
            return;
        }
        java.math.BigDecimal totalSpent = user.getTotalSpent() != null ? user.getTotalSpent() : java.math.BigDecimal.ZERO;
        long completedOrders = user.getCompletedOrdersCount() != null ? user.getCompletedOrdersCount() : 0L;
        String nextLevel = "BRONZE";
        if (totalSpent.compareTo(new java.math.BigDecimal("10000000")) >= 0 || completedOrders >= 100) {
            nextLevel = "PLATINUM";
        } else if (totalSpent.compareTo(new java.math.BigDecimal("5000000")) >= 0 || completedOrders >= 50) {
            nextLevel = "GOLD";
        } else if (totalSpent.compareTo(new java.math.BigDecimal("1000000")) >= 0 || completedOrders >= 10) {
            nextLevel = "SILVER";
        }
        if (!nextLevel.equals(user.getMembershipLevel())) {
            user.setMembershipLevel(nextLevel);
        }
    }

    @Scheduled(
            fixedDelayString = "${app.activation.cleanup-interval-ms:300000}",
            initialDelayString = "${app.activation.cleanup-initial-delay-ms:60000}"
    )
    public void cleanupExpiredUnactivatedAccounts() {
        List<UserActivationToken> expiredTokens
                = userActivationTokenRepository.findTop200ByUsedAtIsNullAndExpiresAtBefore(LocalDateTime.now());
        if (expiredTokens.isEmpty()) {
            return;
        }
        int deletedUsers = 0;
        int deletedTokens = 0;
        Set<Long> deletedUserIds = new HashSet<>();
        for (UserActivationToken token : expiredTokens) {
            User tokenUser = token.getUser();
            Long tokenUserId = tokenUser != null ? tokenUser.getId() : null;
            if (tokenUser != null && tokenUserId != null && !tokenUser.isActivated()) {
                if (!deletedUserIds.contains(tokenUserId)) {
                    userActivationTokenRepository.deleteAllByUser_Id(tokenUserId);
                    userRepository.deleteById(tokenUserId);
                    deletedUserIds.add(tokenUserId);
                    deletedUsers++;
                }
                continue;
            }
            userActivationTokenRepository.delete(token);
            deletedTokens++;
        }
        log.info("Activation cleanup executed: deletedUsers={}, deletedTokens={}", deletedUsers, deletedTokens);
    }

    @Scheduled(
            fixedDelayString = "${app.password-reset.cleanup-interval-ms:300000}",
            initialDelayString = "${app.password-reset.cleanup-initial-delay-ms:60000}"
    )
    public void cleanupExpiredPasswordResetTokens() {
        List<UserPasswordResetToken> expiredTokens
                = userPasswordResetTokenRepository.findTop200ByUsedAtIsNullAndExpiresAtBefore(LocalDateTime.now());
        if (expiredTokens.isEmpty()) {
            return;
        }
        userPasswordResetTokenRepository.deleteAll(expiredTokens);
    }

    private void createActivationTokenAndNotify(User user) {
        if (user == null) {
            return;
        }
        String recipient = user.getEmail();
        if (recipient == null || recipient.trim().isEmpty()) {
            return;
        }
        String otp = String.format("%08d", ThreadLocalRandom.current().nextInt(0, 100_000_000));
        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        UserActivationToken activationToken = new UserActivationToken();
        activationToken.setUser(user);
        activationToken.setToken(token);
        activationToken.setOtpCode(otp);
        activationToken.setDeliveryChannel("EMAIL");
        activationToken.setRecipient(recipient.trim().toLowerCase());
        activationToken.setExpiresAt(LocalDateTime.now().plusHours(Math.max(1, tokenExpireHours)));
        userActivationTokenRepository.save(activationToken);

        String verifyLink = verifyBaseUrl + (verifyBaseUrl.contains("?") ? "&" : "?") + "token=" + token;
        String hours = String.valueOf(Math.max(1, tokenExpireHours));
        String username = user.getUserName() != null ? user.getUserName() : "ban";

        String htmlBody
                = "<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>" + escapeHtml(username) + "</strong>,</p>"
                + "<p style=\"margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#475569;\">Vui lòng nhập mã OTP dưới đây hoặc nhấn nút kích hoạt để hoàn tất:</p>"
                + "<div style=\"text-align:center;margin:32px 0;\">"
                + "  <span style=\"display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;font-size:32px;font-weight:900;letter-spacing:12px;padding:16px 24px;border-radius:16px;margin-bottom:24px;\">" + escapeHtml(otp) + "</span>"
                + "  <br/>"
                + "  <a href=\"" + escapeHtml(verifyLink) + "\" style=\"display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#06b6d4 100%);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:800;box-shadow:0 4px 6px -1px rgba(37,99,235,0.3);\">Kích Hoạt Ngay</a>"
                + "</div>"
                + "<p style=\"margin:0 0 12px 0;font-size:13px;line-height:1.6;color:#64748b;text-align:center;\">Liên kết và OTP sẽ hết hạn sau " + hours + " giờ.</p>"
                + "<p style=\"margin:0;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center;word-break:break-all;\">Nếu nút không hoạt động, hãy copy link này:<br/>" + escapeHtml(verifyLink) + "</p>";

        String subject = "Kich hoat tai khoan The Kinetic Vault";
        postNotification("EMAIL", recipient.trim().toLowerCase(), subject, htmlBody, true);
    }

    private static String escapeHtml(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private void sendAddressChangeNotifications(User user, String action, UserAddress address) {
        sendAddressChangeNotifications(user, action, composeAddressText(address));
    }

    private void sendAddressChangeNotifications(User user, String action, String addressText) {
        if (user == null || user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            return;
        }
        String recipient = user.getEmail().trim().toLowerCase();
        String username = user.getUserName() != null ? user.getUserName().trim() : "";
        String safeAddressText = addressText != null && !addressText.trim().isEmpty() ? addressText.trim() : "(khong co dia chi)";
        String actionVi;
        if ("ADD".equalsIgnoreCase(action)) {
            actionVi = "thêm";
        } else if ("UPDATE".equalsIgnoreCase(action)) {
            actionVi = "cập nhật";
        } else if ("DELETE".equalsIgnoreCase(action)) {
            actionVi = "xóa";
        } else {
            actionVi = "thay đổi";
        }
        
        String subject = "Thông báo cập nhật sổ địa chỉ";
        String htmlBody
                = "<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>" + escapeHtml(username.isEmpty() ? "bạn" : username) + "</strong>,</p>"
                + "<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#475569;\">Bạn vừa <strong style=\"color:#0f172a;\">" + escapeHtml(actionVi) + "</strong> một địa chỉ giao hàng trong sổ địa chỉ của mình.</p>"
                + "<div style=\"background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:24px 0;\">"
                + "  <p style=\"margin:0;font-size:14px;color:#0f172a;line-height:1.6;\">" + escapeHtml(safeAddressText) + "</p>"
                + "</div>"
                + "<p style=\"margin:0;font-size:13px;line-height:1.6;color:#64748b;\">Nếu không phải bạn, vui lòng kiểm tra lại tài khoản và đổi mật khẩu.</p>";

        // Only send EMAIL channel, no WEB channel
        postNotification("EMAIL", recipient, subject, htmlBody, true);
    }

    private String composeAddressText(UserAddress address) {
        if (address == null) {
            return null;
        }
        String baseAddr = trimToNull(address.getFullAddress());
        if (baseAddr == null) {
            String street = trimToNull(address.getStreetLine());
            String ward = trimToNull(address.getWardName());
            String province = trimToNull(address.getProvinceName());
            StringBuilder sb = new StringBuilder();
            if (street != null) {
                sb.append(street);
            }
            if (ward != null) {
                if (sb.length() > 0) {
                    sb.append(", ");
                }
                sb.append(ward);
            }
            if (province != null) {
                if (sb.length() > 0) {
                    sb.append(", ");
                }
                sb.append(province);
            }
            baseAddr = sb.length() > 0 ? sb.toString() : null;
        }
        String phone = trimToNull(address.getPhoneNumber());
        if (phone != null) {
            return baseAddr != null ? baseAddr + " | SDT " + phone : "SDT " + phone;
        }
        return baseAddr;
    }

    private void postNotification(String channel, String recipient, String subject, String body, boolean html) {
        String sendUrl = notificationSendUrl != null ? notificationSendUrl.trim() : "";
        if (sendUrl.isEmpty() || recipient == null || recipient.trim().isEmpty()) {
            return;
        }
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/json;charset=UTF-8"));
            String escapedBody = String.valueOf(body).replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
            String escapedSubject = String.valueOf(subject).replace("\\", "\\\\").replace("\"", "\\\"");
            String escapedRecipient = recipient.trim().replace("\\", "\\\\").replace("\"", "\\\"");
            String json = "{"
                    + "\"channel\":\"" + String.valueOf(channel).replace("\"", "") + "\","
                    + "\"recipient\":\"" + escapedRecipient + "\","
                    + "\"subject\":\"" + escapedSubject + "\","
                    + "\"body\":\"" + escapedBody + "\","
                    + "\"html\":" + (html ? "true" : "false")
                    + "}";
            restTemplate.postForEntity(sendUrl, new HttpEntity<String>(json, headers), String.class);
        } catch (Exception e) {
            log.warn("Failed to send {} notification to {}: {}", channel, recipient, String.valueOf(e.getMessage()));
        }
    }

    private void sendLoginDeviceApprovalEmail(User user, UserLoginDeviceApprovalToken loginOtp) {
        if (user == null || loginOtp == null || user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            return;
        }
        String who = user.getUserName() != null ? user.getUserName() : "ban";
        String device = loginOtp.getDeviceLabel() != null && !loginOtp.getDeviceLabel().trim().isEmpty()
                ? loginOtp.getDeviceLabel().trim()
                : "Thiet bi dang nhap";
        String ipText = loginOtp.getIpAddress() != null && !loginOtp.getIpAddress().trim().isEmpty()
                ? loginOtp.getIpAddress().trim()
                : "Khong xac dinh";
        String locationText = loginOtp.getLocationLabel() != null && !loginOtp.getLocationLabel().trim().isEmpty()
                ? loginOtp.getLocationLabel().trim()
                : "Chua cap quyen vi tri";
        String otpText = loginOtp.getOtpCode() != null ? loginOtp.getOtpCode().trim() : "";
        
        String htmlBody
                = "<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>" + escapeHtml(who) + "</strong>,</p>"
                + "<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#475569;\">Hệ thống vừa ghi nhận một yêu cầu đăng nhập từ thiết bị mới. Vui lòng sử dụng mã OTP dưới đây để xác nhận:</p>"
                + "<div style=\"text-align:center;margin:24px 0;\">"
                + "  <span style=\"display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;font-size:32px;font-weight:900;letter-spacing:12px;padding:16px 24px;border-radius:16px;\">" + escapeHtml(otpText) + "</span>"
                + "</div>"
                + "<div style=\"background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:24px 0;font-size:13px;line-height:1.8;color:#475569;\">"
                + "  <p style=\"margin:0;\"><strong>Thiết bị:</strong> " + escapeHtml(device) + "</p>"
                + "  <p style=\"margin:0;\"><strong>IP:</strong> " + escapeHtml(ipText) + "</p>"
                + "  <p style=\"margin:0;\"><strong>Vị trí:</strong> " + escapeHtml(locationText) + "</p>"
                + "  <p style=\"margin:0;\"><strong>Thời gian:</strong> " + escapeHtml(LocalDateTime.now().toString()) + "</p>"
                + "</div>"
                + "<p style=\"margin:0;font-size:13px;line-height:1.6;color:#ef4444;\">OTP có hiệu lực trong " + Math.max(5, loginDeviceTokenExpireMinutes) + " phút. Nếu không phải bạn, hãy đổi mật khẩu ngay lập tức!</p>";

        postNotification("EMAIL", user.getEmail().trim(), "OTP dang nhap The Kinetic Vault", htmlBody, true);
    }

    private void sendPasswordResetEmail(User user, String token) {
        if (user == null || user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            return;
        }
        String verifyLink = passwordResetVerifyBaseUrl + (passwordResetVerifyBaseUrl.contains("?") ? "&" : "?") + "token=" + token;
        String who = user.getUserName() != null ? user.getUserName() : "ban";
        String htmlBody
                = "<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>" + escapeHtml(who) + "</strong>,</p>"
                + "<p style=\"margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#475569;\">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng nhấn nút bên dưới để tạo mật khẩu mới:</p>"
                + "<div style=\"text-align:center;margin:32px 0;\">"
                + "  <a href=\"" + escapeHtml(verifyLink) + "\" style=\"display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#06b6d4 100%);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:800;box-shadow:0 4px 6px -1px rgba(37,99,235,0.3);\">Đặt Lại Mật Khẩu Ngay</a>"
                + "</div>"
                + "<p style=\"margin:0 0 12px 0;font-size:13px;line-height:1.6;color:#64748b;text-align:center;\">Liên kết có hiệu lực trong " + Math.max(5, passwordResetTokenExpireMinutes) + " phút.</p>"
                + "<p style=\"margin:0;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center;word-break:break-all;\">Nếu nút không hoạt động, hãy copy link này:<br/>" + escapeHtml(verifyLink) + "</p>";

        postNotification("EMAIL", user.getEmail().trim(), "Dat lai mat khau The Kinetic Vault", htmlBody, true);
    }

    public static String buildDeviceFingerprint(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(String.valueOf(raw).getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }

    @Override
    public User updateUserStats(Long userId, com.rainbowforest.userservice.dto.UserStatsUpdateRequest request) {
        if (userId == null || userId <= 0 || request == null) {
            return null;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        
        java.math.BigDecimal currentSpent = user.getTotalSpent() != null ? user.getTotalSpent() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal addSpent = request.getTotalSpentToAdd() != null ? request.getTotalSpentToAdd() : java.math.BigDecimal.ZERO;
        user.setTotalSpent(currentSpent.add(addSpent));

        long currentCount = user.getCompletedOrdersCount() != null ? user.getCompletedOrdersCount() : 0L;
        long addCount = request.getCompletedOrdersToAdd() != null ? request.getCompletedOrdersToAdd() : 0L;
        user.setCompletedOrdersCount(currentCount + addCount);

        adjustMembershipLevel(user);
        return userRepository.save(user);
    }

    @Override
    public User setExactUserStats(Long userId, com.rainbowforest.userservice.dto.UserStatsUpdateRequest request) {
        if (userId == null || userId <= 0 || request == null) {
            return null;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        
        java.math.BigDecimal exactSpent = request.getTotalSpentToAdd() != null ? request.getTotalSpentToAdd() : java.math.BigDecimal.ZERO;
        user.setTotalSpent(exactSpent);

        long exactCount = request.getCompletedOrdersToAdd() != null ? request.getCompletedOrdersToAdd() : 0L;
        user.setCompletedOrdersCount(exactCount);

        adjustMembershipLevel(user);
        return userRepository.save(user);
    }
}
