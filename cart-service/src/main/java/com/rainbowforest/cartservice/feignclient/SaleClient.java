package com.rainbowforest.cartservice.feignclient;

import com.rainbowforest.cartservice.domain.SaleProgram;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@FeignClient(name = "sale-service")
public interface SaleClient {
    @GetMapping(value = "/sales/active")
    List<SaleProgram> getActivePrograms();
}
