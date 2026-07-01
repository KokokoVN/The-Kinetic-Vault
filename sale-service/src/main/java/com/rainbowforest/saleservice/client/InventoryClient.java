package com.rainbowforest.saleservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

/**
 * Feign client gọi inventory-service qua API Gateway để lấy tồn kho thực tế.
 */
@FeignClient(name = "inventory-client", url = "${inventory.service.url}")
public interface InventoryClient {

    @GetMapping("/api/inventory/admin/stock/balances")
    List<Map<String, Object>> getStockBalances(@RequestParam("productId") Long productId);
}
