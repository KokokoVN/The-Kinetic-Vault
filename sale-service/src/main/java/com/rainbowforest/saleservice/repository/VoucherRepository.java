package com.rainbowforest.saleservice.repository;

import com.rainbowforest.saleservice.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);
    boolean existsByCode(String code);

    /**
     * Lấy danh sách voucher đang active, chưa hết hạn, chưa hết lượt.
     */
    @Query("SELECT v FROM Voucher v WHERE v.active = true "
            + "AND (v.startsAt IS NULL OR v.startsAt <= :now) "
            + "AND (v.expiresAt IS NULL OR v.expiresAt > :now) "
            + "AND (v.maxUsage IS NULL OR v.usageCount < v.maxUsage) "
            + "ORDER BY v.expiresAt ASC")
    List<Voucher> findActiveVouchers(@Param("now") LocalDateTime now);
}
