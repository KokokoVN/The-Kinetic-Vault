package com.rainbowforest.paymentservice.repository;

import com.rainbowforest.paymentservice.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    boolean existsByTransactionRef(String transactionRef);
}
