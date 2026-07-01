package com.rainbowforest.saleservice.repository;

import com.rainbowforest.saleservice.entity.SaleProgramItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleProgramItemRepository extends JpaRepository<SaleProgramItem, Long> {

    List<SaleProgramItem> findBySaleProgram_Id(Long saleProgramId);

    @Query("SELECT spi FROM SaleProgramItem spi " +
           "JOIN spi.saleProgram sp " +
           "WHERE spi.productId = :productId " +
           "AND (spi.variantId IS NULL OR :variantId IS NULL OR spi.variantId = :variantId) " +
           "AND sp.active = true " +
           "AND sp.startAt < :endAt AND sp.endAt > :startAt " +
           "AND sp.id <> :excludeProgramId")
    List<SaleProgramItem> findOverlapping(
            @Param("productId") Long productId,
            @Param("variantId") Long variantId,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("excludeProgramId") Long excludeProgramId);
}
