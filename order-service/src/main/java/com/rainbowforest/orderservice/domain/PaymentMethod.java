package com.rainbowforest.orderservice.domain;

import java.util.Locale;

public enum PaymentMethod {
    COD,
    BANK_TRANSFER,
    CARD,
    SEPAY;

    public static PaymentMethod fromNullable(String rawValue) {
        if (rawValue == null || rawValue.trim().isEmpty()) {
            return null;
        }
        String normalized = rawValue.trim().toUpperCase(Locale.ROOT);
        for (PaymentMethod method : values()) {
            if (method.name().equals(normalized)) {
                return method;
            }
        }
        throw new IllegalArgumentException("Unsupported payment method: " + rawValue);
    }
}

