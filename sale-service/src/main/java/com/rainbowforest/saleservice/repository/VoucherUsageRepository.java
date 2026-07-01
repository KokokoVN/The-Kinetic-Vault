package com.rainbowforest.saleservice.repository;

import com.rainbowforest.saleservice.entity.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {
    boolean existsByVoucherIdAndUserId(Long voucherId, Long userId);
    int countByVoucherIdAndUserId(Long voucherId, Long userId);
    List<VoucherUsage> findByVoucherId(Long voucherId);
    List<VoucherUsage> findByVoucherIdOrderByUsedAtDesc(Long voucherId);
    List<VoucherUsage> findByUserId(Long userId);
}
