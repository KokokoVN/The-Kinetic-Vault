package com.rainbowforest.inventoryservice.service;

import com.rainbowforest.inventoryservice.entity.InventoryBalance;
import com.rainbowforest.inventoryservice.entity.StockMovement;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface StockService {

    StockMovement inbound(Long productId, Long variantId, int quantity, String referenceType,
                          Long referenceId, String note, BigDecimal unitCost, LocalDateTime movementAt, String performedBy);

    StockMovement outbound(Long productId, Long variantId, int quantity, String referenceType,
                           Long referenceId, String note, BigDecimal unitCost, LocalDateTime movementAt, String performedBy);

    List<InventoryBalance> balancesForProduct(Long productId);

    List<StockMovement> movementsForProduct(Long productId);

    org.springframework.data.domain.Page<InventoryBalance> getAllBalances(org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<StockMovement> getAllMovements(org.springframework.data.domain.Pageable pageable);
}

