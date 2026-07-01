package com.rainbowforest.cartservice.utilities;

import com.rainbowforest.cartservice.domain.Product;

import java.math.BigDecimal;

public class CartUtilities {
    public static BigDecimal getSubTotalForItem(Product product, Integer quantity) {
        return getSubTotalForItem(product, null, quantity);
    }

    public static BigDecimal getSubTotalForItem(Product product, BigDecimal unitPriceOverride, Integer quantity) {
        if (product == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal unitPrice = unitPriceOverride != null
                ? unitPriceOverride
                : (product.getEffectivePrice() != null ? product.getEffectivePrice() : product.getPrice());
        if (unitPrice == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity.longValue()));
    }
}
