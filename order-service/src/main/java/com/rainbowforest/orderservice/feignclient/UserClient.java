package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "User", url = "http://localhost:8811/")
public interface UserClient {

    @GetMapping(value = "/users/{id}")
    UserClientResponse getUserById(@PathVariable("id") Long id);

    @org.springframework.web.bind.annotation.PutMapping(value = "/users/{id}/stats")
    void updateUserStats(@PathVariable("id") Long id, @org.springframework.web.bind.annotation.RequestBody com.rainbowforest.orderservice.dto.UserStatsUpdateRequest request);

    @org.springframework.web.bind.annotation.PutMapping(value = "/users/{id}/stats/exact")
    void setExactUserStats(@PathVariable("id") Long id, @org.springframework.web.bind.annotation.RequestBody com.rainbowforest.orderservice.dto.UserStatsUpdateRequest request);
}
