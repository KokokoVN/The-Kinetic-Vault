package com.rainbowforest.paymentservice.controller;

import com.rainbowforest.activitylog.ActivityLogPublisher;
import com.rainbowforest.paymentservice.dto.CreatePaymentRequest;
import com.rainbowforest.paymentservice.entity.Payment;
import com.rainbowforest.paymentservice.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class PaymentController {

    private final PaymentService paymentService;
    private final ActivityLogPublisher activityLogPublisher;

    public PaymentController(PaymentService paymentService, ActivityLogPublisher activityLogPublisher) {
        this.paymentService = paymentService;
        this.activityLogPublisher = activityLogPublisher;
    }

    @PostMapping("/create")
    public ResponseEntity<Payment> create(@Valid @RequestBody CreatePaymentRequest request) {
        Payment saved = paymentService.create(request);
        activityLogPublisher.publish(
                "payment-service",
                "PAYMENT_CREATE",
                "Payment",
                String.valueOf(saved.getId()),
                "POST",
                "/create",
                paymentDetailAfter(saved),
                null,
                null);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getById(@PathVariable Long id) {
        return paymentService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Payment>> byOrder(@PathVariable Long orderId) {
        List<Payment> list = paymentService.findByOrderId(orderId);
        if (list.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(list);
    }

    /**
     * Idempotent: re-send PAID to order-service when at least one payment row is COMPLETED.
     * Used after SePay success redirect when the first sync failed (e.g. transient network).
     */
    @PostMapping("/order/{orderId}/reconcile-paid")
    public ResponseEntity<Map<String, Object>> reconcilePaid(@PathVariable Long orderId) {
        boolean applied = paymentService.reconcilePaidOrder(orderId);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("orderId", orderId);
        body.put("reconciled", applied);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Payment> complete(
            @PathVariable Long id,
            @RequestParam(value = "transactionRef", required = false) String transactionRef) {
        return paymentService.complete(id, transactionRef)
                .map(p -> {
                    activityLogPublisher.publish(
                            "payment-service",
                            "PAYMENT_COMPLETE",
                            "Payment",
                            String.valueOf(p.getId()),
                            "POST",
                            "/" + id + "/complete",
                            paymentDetailAfter(p),
                            null,
                            null);
                    return ResponseEntity.ok(p);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/{id}/fail")
    public ResponseEntity<Payment> fail(@PathVariable Long id) {
        return paymentService.fail(id)
                .map(p -> {
                    activityLogPublisher.publish(
                            "payment-service",
                            "PAYMENT_FAIL",
                            "Payment",
                            String.valueOf(p.getId()),
                            "POST",
                            "/" + id + "/fail",
                            paymentDetailAfter(p),
                            null,
                            null);
                    return ResponseEntity.ok(p);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    private static Map<String, Object> paymentDetailAfter(Payment p) {
        Map<String, Object> after = new LinkedHashMap<>();
        after.put("paymentId", p.getId());
        after.put("orderId", p.getOrderId());
        after.put("amount", p.getAmount() != null ? p.getAmount().toPlainString() : null);
        after.put("currency", p.getCurrency());
        after.put("method", p.getMethod());
        after.put("status", p.getStatus());
        after.put("transactionRef", p.getTransactionRef());
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("resourceType", "Payment");
        detail.put("after", after);
        return detail;
    }
}
