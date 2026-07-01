package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.UserProfileChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserProfileChangeLogRepository extends JpaRepository<UserProfileChangeLog, Long> {
    List<UserProfileChangeLog> findAllByUserDetails_User_IdOrderByChangedAtDesc(Long userId);
}
