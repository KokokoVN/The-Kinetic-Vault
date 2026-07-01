package com.rainbowforest.productcatalogservice.client;

import com.rainbowforest.productcatalogservice.client.dto.ActivityLogRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "activity-log-service")
public interface ActivityLogFeignClient {

    @PostMapping(value = "/log", consumes = "application/json")
    void log(@RequestBody ActivityLogRequest request);
}
