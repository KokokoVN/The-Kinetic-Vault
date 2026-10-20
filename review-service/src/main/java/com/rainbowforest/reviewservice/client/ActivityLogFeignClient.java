package com.rainbowforest.reviewservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "activity-log-service")
public interface ActivityLogFeignClient {

    @PostMapping(value = "/log", consumes = "application/json")
    void log(@RequestBody Map<String, Object> request);
}
