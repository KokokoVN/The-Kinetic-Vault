package com.rainbowforest.paymentservice.config;

import com.rainbowforest.paymentservice.entity.Payment;
import com.rainbowforest.paymentservice.repository.PaymentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Profile("dev")
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class PaymentDataInitializer implements CommandLineRunner {

    private final PaymentRepository paymentRepository;

    public PaymentDataInitializer(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public void run(String... args) {
        seedPayment(10001L, 538000, "VND", "COD", "PENDING", "PAY-DEMO-0001");
        seedPayment(10002L, 599000, "VND", "VNPAY", "PAID", "PAY-DEMO-0002");
        seedPayment(10003L, 808000, "VND", "MOMO", "PAID", "PAY-DEMO-0003");
        seedPayment(10004L, 318000, "VND", "COD", "FAILED", "PAY-DEMO-0004");
    }

    private void seedPayment(
            Long orderId,
            int amount,
            String currency,
            String method,
            String status,
            String transactionRef
    ) {
        if (paymentRepository.existsByTransactionRef(transactionRef)) {
            return;
        }
        Payment p = new Payment();
        p.setOrderId(orderId);
        p.setAmount(BigDecimal.valueOf(amount));
        p.setCurrency(currency);
        p.setMethod(method);
        p.setStatus(status);
        p.setTransactionRef(transactionRef);
        paymentRepository.save(p);
    }
}
