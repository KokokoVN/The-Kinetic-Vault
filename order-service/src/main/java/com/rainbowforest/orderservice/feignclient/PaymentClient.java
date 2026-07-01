package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;

@FeignClient(name = "payment-service", url = "http://localhost:8814/")
public interface PaymentClient {
    @PostMapping("/create")
    PaymentResponse create(@RequestBody CreatePaymentRequest request);

    @PostMapping("/{id}/complete")
    PaymentResponse complete(@PathVariable("id") Long id);

    class CreatePaymentRequest {
        public Long orderId;
        public BigDecimal amount;
        public String currency;
        public String method;
    }

    class PaymentResponse {
        public Long id;
        public Long orderId;
        public String method;
        public String status;
    }
}
