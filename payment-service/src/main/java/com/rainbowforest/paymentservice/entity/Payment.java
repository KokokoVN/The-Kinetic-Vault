package com.rainbowforest.paymentservice.entity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Table(name = "payments")
public class Payment extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "order_id")
    private Long orderId;

    @NotNull
    @Column(name = "amount", precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "currency", length = 8)
    private String currency = "VND";

    @Column(name = "method", length = 32)
    private String method;

    @Column(name = "status", length = 32)
    private String status = "PENDING";

    @Column(name = "transaction_ref", length = 128)
    private String transactionRef;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTransactionRef() {
        return transactionRef;
    }

    public void setTransactionRef(String transactionRef) {
        this.transactionRef = transactionRef;
    }
}
