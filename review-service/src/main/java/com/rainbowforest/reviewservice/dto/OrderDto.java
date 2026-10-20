package com.rainbowforest.reviewservice.dto;

import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class OrderDto {
    private Long id;
    private Long userId;
    private String userName;
    private String orderStatus;
    private List<OrderItemDto> orderItems;
}
