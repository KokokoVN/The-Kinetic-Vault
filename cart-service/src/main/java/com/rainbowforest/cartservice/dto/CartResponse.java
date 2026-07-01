package com.rainbowforest.cartservice.dto;

import com.rainbowforest.cartservice.domain.Item;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CartResponse {
    private String cartId;
    private int itemCount;
    private BigDecimal total;
    private List<Item> items = new ArrayList<>();

    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
        this.cartId = cartId;
    }

    public int getItemCount() {
        return itemCount;
    }

    public void setItemCount(int itemCount) {
        this.itemCount = itemCount;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }
}
