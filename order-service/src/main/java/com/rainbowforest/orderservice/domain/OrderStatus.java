package com.rainbowforest.orderservice.domain;

import java.util.Locale;

public enum OrderStatus {
    CREATED,
    CONFIRMED,
    PAYMENT_EXPECTED,
    PAID,
    PROCESSING,
    PACKING,
    READY_TO_SHIP,
    OUT_FOR_DELIVERY,
    SHIPPED,
    DELIVERY_FAILED,
    RESCHEDULED,
    REFUSED,
    RETURNING,
    RETURNED,
    DELIVERED,
    CANCELLED;

    public static OrderStatus from(String rawValue) {
        if (rawValue == null || rawValue.trim().isEmpty()) {
            throw new IllegalArgumentException("Order status is required");
        }
        String normalized = rawValue.trim().toUpperCase(Locale.ROOT);
        for (OrderStatus status : values()) {
            if (status.name().equals(normalized)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unsupported order status: " + rawValue);
    }
}
