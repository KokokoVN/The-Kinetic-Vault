package com.rainbowforest.paymentservice.service;

import com.rainbowforest.paymentservice.dto.CreatePaymentRequest;
import com.rainbowforest.paymentservice.dto.OrderPaymentStatusRequest;
import com.rainbowforest.paymentservice.entity.Payment;
import com.rainbowforest.paymentservice.feignclient.OrderClient;
import com.rainbowforest.paymentservice.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient;

    public PaymentServiceImpl(PaymentRepository paymentRepository, OrderClient orderClient) {
        this.paymentRepository = paymentRepository;
        this.orderClient = orderClient;
    }

    @Override
    public Payment create(CreatePaymentRequest request) {
        Payment p = new Payment();
        p.setOrderId(request.getOrderId());
        p.setAmount(request.getAmount());
        if (request.getCurrency() != null && !request.getCurrency().isEmpty()) {
            p.setCurrency(request.getCurrency());
        }
        p.setMethod(request.getMethod() != null ? request.getMethod() : "UNSPECIFIED");
        p.setStatus("PENDING");
        p.setTransactionRef("TMP-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        return paymentRepository.save(p);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Payment> findById(Long id) {
        return paymentRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> findByOrderId(Long orderId) {
        return paymentRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
    }

    @Override
    public Optional<Payment> complete(Long id, String transactionRef) {
        return paymentRepository.findById(id).map(p -> {
            if ("FAILED".equalsIgnoreCase(p.getStatus()) || "REFUNDED".equalsIgnoreCase(p.getStatus())) {
                throw new IllegalStateException("Cannot complete payment that is already in final state: " + p.getStatus());
            }
            p.setStatus("COMPLETED");
            if (transactionRef != null && !transactionRef.isEmpty()) {
                p.setTransactionRef(transactionRef);
            }
            Payment saved = paymentRepository.save(p);
            syncOrderPaymentStatus(saved, "PAID");
            return saved;
        });
    }

    @Override
    public Optional<Payment> fail(Long id) {
        return paymentRepository.findById(id).map(p -> {
            if ("COMPLETED".equalsIgnoreCase(p.getStatus()) || "REFUNDED".equalsIgnoreCase(p.getStatus())) {
                throw new IllegalStateException("Cannot fail payment that is already in final state: " + p.getStatus());
            }
            p.setStatus("FAILED");
            Payment saved = paymentRepository.save(p);
            syncOrderPaymentStatus(saved, "FAILED");
            return saved;
        });
    }

    @Override
    public boolean reconcilePaidOrder(Long orderId) {
        if (orderId == null) {
            return false;
        }
        List<Payment> list = paymentRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
        for (Payment p : list) {
            if (p == null || p.getStatus() == null) {
                continue;
            }
            if ("COMPLETED".equalsIgnoreCase(p.getStatus().trim())) {
                syncOrderPaymentStatus(p, "PAID");
                return true;
            }
        }
        return false;
    }

    private void syncOrderPaymentStatus(Payment payment, String paymentStatus) {
        if (payment == null || payment.getOrderId() == null) {
            return;
        }
        try {
            OrderPaymentStatusRequest request = new OrderPaymentStatusRequest();
            request.setPaymentStatus(paymentStatus);
            request.setPaymentMethod(payment.getMethod());
            orderClient.updatePaymentStatus(payment.getOrderId(), request);
        } catch (Exception ex) {
            log.warn("Could not sync order {} payment status to {}: {}", payment.getOrderId(), paymentStatus, ex.toString());
        }
    }
}
