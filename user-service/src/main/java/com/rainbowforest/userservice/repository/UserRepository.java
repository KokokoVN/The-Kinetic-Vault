package com.rainbowforest.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Repository;

import com.rainbowforest.userservice.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUserName(String userName);
    User findFirstByUserNameAndActivatedTrue(String userName);

    User findByEmail(String email);
    User findFirstByEmailAndActivatedTrue(String email);

    User findByPhoneNumber(String phoneNumber);
    User findFirstByPhoneNumberAndActivatedTrue(String phoneNumber);

    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    long countByCreatedAtAfter(LocalDateTime date);
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}
