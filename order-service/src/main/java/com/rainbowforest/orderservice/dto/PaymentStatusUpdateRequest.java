package com.rainbowforest.orderservice.dto;

import javax.validation.constraints.NotBlank;

public class PaymentStatusUpdateRequest {
    @NotBlank
    private String paymentStatus;
    private String paymentMethod;

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
