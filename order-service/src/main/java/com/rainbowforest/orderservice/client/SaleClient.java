package com.rainbowforest.orderservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.rainbowforest.orderservice.dto.SaleProgram;

import java.util.List;
import java.util.Map;

/**
 * Gọi sang sale-service để validate và consume voucher
 */
@FeignClient(name = "sale-client", url = "${sale.service.url:http://localhost:8816}")
public interface SaleClient {

    @PostMapping("/sales/vouchers/validate")
    Map<String, Object> validateVoucher(@RequestBody Map<String, Object> request);

    @PostMapping("/sales/vouchers/consume")
    Map<String, Object> consumeVoucher(@RequestBody Map<String, Object> request);

    @GetMapping(value = "/sales/active")
    List<SaleProgram> getActivePrograms();
}
