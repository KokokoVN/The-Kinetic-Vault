package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.UserLoginDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLoginDeviceRepository extends JpaRepository<UserLoginDevice, Long> {
    Optional<UserLoginDevice> findByUser_IdAndDeviceFingerprint(Long userId, String deviceFingerprint);
    List<UserLoginDevice> findAllByUser_IdOrderByLastSeenAtDesc(Long userId);
    void deleteAllByUser_Id(Long userId);
}
