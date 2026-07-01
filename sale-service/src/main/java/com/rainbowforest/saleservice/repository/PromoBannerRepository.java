package com.rainbowforest.saleservice.repository;

import com.rainbowforest.saleservice.entity.PromoBanner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PromoBannerRepository extends JpaRepository<PromoBanner, Long> {

    @Query("SELECT b FROM PromoBanner b WHERE b.active = true " +
           "AND (b.startAt IS NULL OR b.startAt <= :now) " +
           "AND (b.endAt IS NULL OR b.endAt >= :now) " +
           "ORDER BY b.position ASC")
    List<PromoBanner> findActiveBanners(@Param("now") LocalDateTime now);
}
