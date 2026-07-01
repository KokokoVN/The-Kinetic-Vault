package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.OrderStatus;
import com.rainbowforest.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/orders")
public class InternalOrderController {

    private final OrderRepository orderRepository;

    @Autowired
    public InternalOrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/check-product/{productId}")
    public ResponseEntity<Boolean> checkProductInOrder(
            @PathVariable("productId") Long productId,
            @RequestParam("status") String statusStr) {
        try {
            OrderStatus status = OrderStatus.from(statusStr);
            boolean exists = orderRepository.existsByProductIdAndStatus(productId, status);
            return ResponseEntity.ok(exists);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(false);
        }
    }
}
