package com.rainbowforest.orderservice.domain;

import java.util.Locale;

public enum PaymentStatus {
    PENDING,
    PAID,
    FAILED,
    REFUNDED;

    public static PaymentStatus fromNullable(String rawValue) {
        if (rawValue == null || rawValue.trim().isEmpty()) {
            return null;
        }
        String normalized = rawValue.trim().toUpperCase(Locale.ROOT);
        for (PaymentStatus status : values()) {
            if (status.name().equals(normalized)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unsupported payment status: " + rawValue);
    }
}
