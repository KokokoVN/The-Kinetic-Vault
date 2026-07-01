package com.rainbowforest.paymentservice.service;

import com.rainbowforest.paymentservice.dto.CreatePaymentRequest;
import com.rainbowforest.paymentservice.entity.Payment;

import java.util.List;
import java.util.Optional;

public interface PaymentService {

    Payment create(CreatePaymentRequest request);

    Optional<Payment> findById(Long id);

    List<Payment> findByOrderId(Long orderId);

    Optional<Payment> complete(Long id, String transactionRef);

    Optional<Payment> fail(Long id);

    /**
     * If any payment for this order is COMPLETED, push PAID to order-service again (heals missed sync).
     */
    boolean reconcilePaidOrder(Long orderId);
}
