package com.rainbowforest.userservice.service;

import java.util.List;
import java.util.Optional;

import com.rainbowforest.userservice.dto.PasswordChangeRequest;
import com.rainbowforest.userservice.dto.EmailOtpRequest;
import com.rainbowforest.userservice.dto.VerifyEmailOtpRequest;
import com.rainbowforest.userservice.dto.UserAddressUpsertRequest;
import com.rainbowforest.userservice.dto.UserProfileUpdateRequest;
import com.rainbowforest.userservice.dto.UserRoleUpdateRequest;
import com.rainbowforest.userservice.entity.UserAddress;
import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserLoginDevice;
import com.rainbowforest.userservice.entity.UserProfileChangeLog;

public interface UserService {
    List<User> getAllUsers();
    User getUserById(Long id);
    User getUserProfile(Long id);
    User getUserByName(String userName);
    User getUserByUsernameOrEmail(String identity);
    User findByEmail(String email);
    User saveUser(User user);
    User registerUser(User user);
    User createPendingRegistration(User user);
    boolean verifyPendingRegistration(String identity, String otp);
    String resendPendingRegistrationOtp(String identity);
    boolean activateUser(String token);
    boolean verifyActivationOtp(String identity, String otp);
    String resendActivationOtp(String identity);
    void sendActivationOtp(User user);
    boolean isLoginDeviceApproved(User user, String deviceFingerprint);
    void requestLoginDeviceApproval(User user, String deviceFingerprint, String deviceLabel, String ipAddress, String location, String timeZone, String locale);
    User approveLoginDevice(String token);
    User verifyLoginOtp(String identity, String otp, String deviceFingerprint);
    String resendLoginOtp(String identity, String deviceFingerprint);
    void markLoginDeviceSeen(User user, String deviceFingerprint, String deviceLabel, String ipAddress, String location, String timeZone, String locale);
    void requestPasswordReset(String identity);
    boolean resetPassword(String token, String newPassword);

    Optional<User> authenticate(String username, String password);
    boolean unlockUser(Long userId);
    List<UserLoginDevice> getUserLoginDevices(Long userId);
    List<UserProfileChangeLog> getUserProfileChangeLogs(Long userId);

    UserAddress getUserAddress(Long userId);
    List<UserAddress> listUserAddresses(Long userId);
    UserAddress createUserAddress(Long userId, UserAddressUpsertRequest request);
    UserAddress updateUserAddress(Long userId, Long addressId, UserAddressUpsertRequest request);
    UserAddress setUserAddressDefault(Long userId, Long addressId);
    boolean deleteUserAddress(Long userId, Long addressId);

    User updateProfile(Long userId, UserProfileUpdateRequest request);
    User updateUserRole(Long userId, UserRoleUpdateRequest request);
    User updateAvatar(Long userId, String avatarUrl, String performedBy);
    String requestEmailChangeOtp(Long userId, EmailOtpRequest request);
    String resendEmailChangeOtp(Long userId, EmailOtpRequest request);
    boolean verifyEmailChangeOtp(Long userId, VerifyEmailOtpRequest request);
    User confirmEmailChange(Long userId, VerifyEmailOtpRequest request);
    boolean changePassword(Long userId, PasswordChangeRequest request);
    boolean verifyPassword(Long userId, String password);
    User updateUserStats(Long userId, com.rainbowforest.userservice.dto.UserStatsUpdateRequest request);
    User setExactUserStats(Long userId, com.rainbowforest.userservice.dto.UserStatsUpdateRequest request);
}
