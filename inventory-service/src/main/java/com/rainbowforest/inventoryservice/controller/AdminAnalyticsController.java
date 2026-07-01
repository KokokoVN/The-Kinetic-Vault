package com.rainbowforest.inventoryservice.controller;

import com.rainbowforest.inventoryservice.entity.InventoryBalance;
import com.rainbowforest.inventoryservice.repository.InventoryBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/analytics")
public class AdminAnalyticsController {

    @Autowired
    private InventoryBalanceRepository inventoryBalanceRepository;

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryBalance>> getLowStock(@RequestParam(defaultValue = "10") Integer threshold) {
        List<InventoryBalance> lowStock = inventoryBalanceRepository.findTop10ByQuantityOnHandLessThanEqualOrderByQuantityOnHandAsc(threshold);
        return ResponseEntity.ok(lowStock);
    }
}
