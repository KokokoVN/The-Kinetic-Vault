package com.rainbowforest.inventoryservice.repository;

import com.rainbowforest.inventoryservice.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Query("select m from StockMovement m " +
            "where m.productId = :productId " +
            "order by m.movementAt desc, m.id desc")
    List<StockMovement> findForHistoryByProductId(@Param("productId") Long productId);
}

