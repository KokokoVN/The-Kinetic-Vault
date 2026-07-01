package com.rainbowforest.paymentservice.dto;

/**
 * Body for order-service payment sync. Uses JavaBean shape for Feign/Jackson encoding.
 */
public class OrderPaymentStatusRequest {
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
