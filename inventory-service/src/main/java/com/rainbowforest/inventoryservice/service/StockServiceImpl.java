package com.rainbowforest.inventoryservice.service;

import com.rainbowforest.inventoryservice.client.ProductCatalogInternalClient;
import com.rainbowforest.inventoryservice.entity.InventoryBalance;
import com.rainbowforest.inventoryservice.entity.StockMovement;
import com.rainbowforest.inventoryservice.repository.InventoryBalanceRepository;
import com.rainbowforest.inventoryservice.repository.StockMovementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class StockServiceImpl implements StockService {

    private final InventoryBalanceRepository inventoryBalanceRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ProductCatalogInternalClient productCatalogInternalClient;
    private final com.rainbowforest.inventoryservice.client.TelegramInternalClient telegramInternalClient;

    public StockServiceImpl(InventoryBalanceRepository inventoryBalanceRepository,
                            StockMovementRepository stockMovementRepository,
                            ProductCatalogInternalClient productCatalogInternalClient,
                            com.rainbowforest.inventoryservice.client.TelegramInternalClient telegramInternalClient) {
        this.inventoryBalanceRepository = inventoryBalanceRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.productCatalogInternalClient = productCatalogInternalClient;
        this.telegramInternalClient = telegramInternalClient;
    }

    @Override
    public StockMovement inbound(Long productId, Long variantId, int quantity, String referenceType,
                                 Long referenceId, String note, BigDecimal unitCost, LocalDateTime movementAt, String performedBy) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity phải > 0");
        }

        InventoryBalance bal = getOrCreateBalance(productId, variantId)
                .orElseGet(() -> {
                    InventoryBalance b = new InventoryBalance();
                    b.setProductId(productId);
                    b.setVariantId(variantId);
                    b.setQuantityOnHand(0);
                    return inventoryBalanceRepository.save(b);
                });
        bal.setQuantityOnHand(bal.getQuantityOnHand() + quantity);
        if (performedBy != null) {
            bal.setUpdatedBy(performedBy);
        }
        inventoryBalanceRepository.save(bal);

        StockMovement m = new StockMovement();
        m.setMovementType(StockMovement.INBOUND);
        m.setProductId(productId);
        m.setVariantId(variantId);
        m.setQuantity(quantity);
        m.setReferenceType(referenceType);
        m.setReferenceId(referenceId);
        m.setNote(note);
        m.setUnitCost(unitCost);
        m.setMovementAt(movementAt != null ? movementAt : LocalDateTime.now());
        m.setBalanceAfter(bal.getQuantityOnHand());
        if (performedBy != null) {
            m.setCreatedBy(performedBy);
            m.setUpdatedBy(performedBy);
        }
        stockMovementRepository.save(m);

        syncProductAvailability(productId, variantId);
        return m;
    }

    @Override
    public StockMovement outbound(Long productId, Long variantId, int quantity, String referenceType,
                                  Long referenceId, String note, BigDecimal unitCost, LocalDateTime movementAt, String performedBy) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity phải > 0");
        }
        InventoryBalance bal = getExistingBalance(productId, variantId)
                .orElseThrow(() -> new IllegalStateException("Chưa có tồn kho cho sản phẩm"));
        if (bal.getQuantityOnHand() < quantity) {
            throw new IllegalStateException("Không đủ tồn kho (còn " + bal.getQuantityOnHand() + ")");
        }

        bal.setQuantityOnHand(bal.getQuantityOnHand() - quantity);
        if (performedBy != null) {
            bal.setUpdatedBy(performedBy);
        }
        inventoryBalanceRepository.save(bal);

        StockMovement m = new StockMovement();
        m.setMovementType(StockMovement.OUTBOUND);
        m.setProductId(productId);
        m.setVariantId(variantId);
        m.setQuantity(quantity);
        m.setReferenceType(referenceType);
        m.setReferenceId(referenceId);
        m.setNote(note);
        m.setUnitCost(unitCost);
        m.setMovementAt(movementAt != null ? movementAt : LocalDateTime.now());
        m.setBalanceAfter(bal.getQuantityOnHand());
        if (performedBy != null) {
            m.setCreatedBy(performedBy);
            m.setUpdatedBy(performedBy);
        }
        stockMovementRepository.save(m);

        syncProductAvailability(productId, variantId);
        
        if (bal.getQuantityOnHand() < 10) {
            notifyLowStock(productId, variantId, bal.getQuantityOnHand());
        }
        
        return m;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryBalance> balancesForProduct(Long productId) {
        return inventoryBalanceRepository.findAllByProductId(productId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMovement> movementsForProduct(Long productId) {
        return stockMovementRepository.findForHistoryByProductId(productId);
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<InventoryBalance> getAllBalances(org.springframework.data.domain.Pageable pageable) {
        return inventoryBalanceRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<StockMovement> getAllMovements(org.springframework.data.domain.Pageable pageable) {
        return stockMovementRepository.findAll(pageable);
    }

    private void syncProductAvailability(Long productId, Long variantId) {
        Number sum = inventoryBalanceRepository.sumQuantityByProductId(productId);
        int total = sum == null ? 0 : sum.intValue();
        try {
            productCatalogInternalClient.updateProductAvailability(productId, total);
        } catch (Exception ignored) {
            // Nếu product-service down thì vẫn ghi tồn kho thành công; availability sẽ sync lại ở lần sau.
        }
        if (variantId != null) {
            try {
                productCatalogInternalClient.updateVariantAvailability(variantId, getVariantBalance(productId, variantId));
            } catch (Exception ignored) {
                // variant availability best-effort
            }
        }
    }

    private int getVariantBalance(Long productId, Long variantId) {
        return inventoryBalanceRepository.findByProductIdAndVariantId(productId, variantId)
                .map(InventoryBalance::getQuantityOnHand)
                .orElse(0);
    }

    private java.util.Optional<InventoryBalance> getOrCreateBalance(Long productId, Long variantId) {
        return getExistingBalance(productId, variantId);
    }

    private java.util.Optional<InventoryBalance> getExistingBalance(Long productId, Long variantId) {
        return inventoryBalanceRepository.findByProductIdAndVariantId(productId, variantId);
    }
    
    private void notifyLowStock(Long productId, Long variantId, int remaining) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                String productName = null;
                try {
                    Object p = productCatalogInternalClient.getProduct(productId);
                    if (p instanceof java.util.Map) {
                        productName = (String) ((java.util.Map<?, ?>) p).get("name");
                    }
                } catch (Exception ignored) {}
                
                java.util.Map<String, Object> req = new java.util.HashMap<>();
                req.put("productId", productId);
                if (variantId != null) {
                    req.put("variantId", variantId);
                }
                if (productName != null) {
                    req.put("productName", productName);
                }
                req.put("quantityOnHand", remaining);
                telegramInternalClient.notifyLowStock(req);
            } catch (Exception e) {
                // Do not block outbound if telegram fails
                System.err.println("Failed to send low stock notification: " + e.getMessage());
            }
        });
    }
}

