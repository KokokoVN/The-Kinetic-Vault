package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.UserLoginDeviceApprovalToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserLoginDeviceApprovalTokenRepository extends JpaRepository<UserLoginDeviceApprovalToken, Long> {
    Optional<UserLoginDeviceApprovalToken> findByToken(String token);
    Optional<UserLoginDeviceApprovalToken> findTop1ByUser_IdAndDeviceFingerprintAndUsedAtIsNullOrderByIdDesc(Long userId, String deviceFingerprint);
    Optional<UserLoginDeviceApprovalToken> findTop1ByUser_IdAndOtpCodeAndUsedAtIsNullOrderByIdDesc(Long userId, String otpCode);
    void deleteAllByUser_Id(Long userId);
}
