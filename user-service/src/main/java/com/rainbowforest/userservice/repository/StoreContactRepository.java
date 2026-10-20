package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.StoreContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreContactRepository extends JpaRepository<StoreContact, Long> {
    Optional<StoreContact> findFirstByIsPrimaryTrueAndIsActiveTrue();
    Optional<StoreContact> findFirstByIsActiveTrueOrderByIdAsc();
    List<StoreContact> findAllByIsActiveTrueOrderByIdAsc();
    List<StoreContact> findAllByDeletedAtIsNullOrderByIdAsc();
}
