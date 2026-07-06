package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;
import org.springframework.data.domain.Page;
import java.util.List;
import java.util.Optional;

public interface OrderService {
    Order saveOrder(Order order);
    Optional<Order> getOrderById(Long id);
    Optional<Order> getOrderByMvdAndPhoneLast4(String mvd, String phoneLast4);
    Order updatePaymentStatus(Long id, String paymentStatus, String paymentMethod);
    List<Order> listOrders(Long userId, String status, String paymentStatus, String q, String startDate, String endDate);
    Page<Order> searchOrders(Long userId, String status, String paymentStatus, String q, String startDate, String endDate, int page, int size);
    Order updateOrderStatus(Long id, String status, String paymentStatus, String shippingAddress, String performedBy);
    void deductInventoryForOrder(Order order, String performedBy);
    byte[] exportOrdersToPdf(String status, String paymentStatus, String q, String startDate, String endDate) throws Exception;
}
