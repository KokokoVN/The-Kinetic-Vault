package com.rainbowforest.orderservice.dto;

import java.util.List;

public class ReviewOrderDto {

    private Long id;
    private Long userId;
    private String orderStatus;
    private List<ReviewOrderItemDto> orderItems;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public List<ReviewOrderItemDto> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<ReviewOrderItemDto> orderItems) {
        this.orderItems = orderItems;
    }
}
