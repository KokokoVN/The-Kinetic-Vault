package com.rainbowforest.reviewservice.dto;

import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class OrderDto {
    private Long id;
    private Long userId;
    private String orderStatus; // Assuming enum or string
    private List<OrderItemDto> orderItems;
}
