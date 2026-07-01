package com.rainbowforest.apigateway.client;

import com.rainbowforest.apigateway.client.dto.WebActivityLogRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "activity-log-service")
public interface ActivityLogClient {

    @PostMapping(value = "/log", consumes = "application/json")
    void log(@RequestBody WebActivityLogRequest request);
}
