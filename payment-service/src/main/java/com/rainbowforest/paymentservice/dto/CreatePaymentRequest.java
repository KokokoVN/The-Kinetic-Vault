package com.rainbowforest.paymentservice.dto;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CreatePaymentRequest {

    @NotNull
    private Long orderId;
    @NotNull
    private BigDecimal amount;
    private String currency;
    private String method;

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
}
