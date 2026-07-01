package com.rainbowforest.aichatbotservice.client;

import com.rainbowforest.aichatbotservice.dto.sale.SaleProgramDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(
        name = "sale-service",
        url = "${sale.service.url:http://localhost:8816}"
)
public interface SaleServiceClient {

    /**
     * Lấy danh sách chương trình sale đang active.
     * Endpoint: GET /active (PublicSaleController)
     */
    @GetMapping("/active")
    List<SaleProgramDto> getActivePrograms();
}
