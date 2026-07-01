package com.rainbowforest.inventoryservice.repository;

import com.rainbowforest.inventoryservice.entity.InventoryBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryBalanceRepository extends JpaRepository<InventoryBalance, Long> {

    Optional<InventoryBalance> findByProductIdAndVariantId(Long productId, Long variantId);
    
    @Query("SELECT b FROM InventoryBalance b WHERE b.productId = :pid AND ((:vid IS NULL AND b.variantId IS NULL) OR b.variantId = :vid) ORDER BY b.id ASC")
    List<InventoryBalance> findAllByProductIdAndVariantIdSafe(@Param("pid") Long productId, @Param("vid") Long variantId);

    List<InventoryBalance> findAllByProductId(Long productId);

    @Query("SELECT COALESCE(SUM(b.quantityOnHand), 0) FROM InventoryBalance b WHERE b.productId = :pid")
    Number sumQuantityByProductId(@Param("pid") Long productId);

    List<InventoryBalance> findTop10ByQuantityOnHandLessThanEqualOrderByQuantityOnHandAsc(Integer threshold);
}

