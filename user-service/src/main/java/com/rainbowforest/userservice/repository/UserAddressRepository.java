package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findAllByUserDetails_IdOrderByIsDefaultDescIdDesc(Long userDetailsId);

    List<UserAddress> findAllByUserDetails_User_IdOrderByIsDefaultDescIdDesc(Long userId);

    Optional<UserAddress> findByIdAndUserDetails_User_Id(Long id, Long userId);

    Optional<UserAddress> findFirstByUserDetails_User_IdAndIsDefaultTrue(Long userId);

    void deleteByIdAndUserDetails_User_Id(Long id, Long userId);
}

