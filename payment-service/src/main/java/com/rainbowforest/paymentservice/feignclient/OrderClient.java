package com.rainbowforest.paymentservice.feignclient;

import com.rainbowforest.paymentservice.dto.OrderPaymentStatusRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "order-service", url = "http://localhost:8813/")
public interface OrderClient {
    /**
     * POST (not PATCH): OpenFeign on Java 8 / HttpURLConnection often cannot send PATCH reliably.
     */
    @PostMapping("/orders/{id}/payment-status")
    void updatePaymentStatus(@PathVariable("id") Long orderId, @RequestBody OrderPaymentStatusRequest request);
}
