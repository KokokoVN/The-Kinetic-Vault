package com.rainbowforest.orderservice.service;


import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.repository.OrderRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import java.util.Optional;
import java.time.LocalDate;


@RunWith(SpringRunner.class)
@SpringBootTest
public class OrderServiceTests {

    private final Long ORDER_ID = 1L;
    private final String ORDER_STATUS = "testStatus";
    private Order order;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Before
    public void setUp(){
        order = new Order();
        order.setId(ORDER_ID);
        order.setStatus(ORDER_STATUS);
    }

    @Test
    public void save_order_test(){
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Order created = orderService.saveOrder(order);

        assertEquals(created.getId(), ORDER_ID);
        assertEquals(created.getStatus(), ORDER_STATUS);
        verify(orderRepository, times(1)).save(any(Order.class));
        verifyNoMoreInteractions(orderRepository);

    }

    @Test
    public void update_order_status_should_allow_valid_transition() {
        order.setStatus("PAYMENT_EXPECTED");
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Order updated = orderService.updateOrderStatus(
                ORDER_ID,
                "PAID",
                "PAID",
                "HN",
                "tester"
        );

        assertEquals("PAID", updated.getStatus());
        // PATCH /status không cập nhật payment_status (chỉ payment callback mới đổi).
        verify(orderRepository, times(1)).findById(ORDER_ID);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    public void update_order_status_should_reject_invalid_transition() {
        order.setStatus("PAYMENT_EXPECTED");
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));

        try {
            orderService.updateOrderStatus(ORDER_ID, "DELIVERED", null, null, null);
            fail("Expected IllegalArgumentException for invalid status transition");
        } catch (IllegalArgumentException expected) {
            // expected
        }

        verify(orderRepository, times(1)).findById(ORDER_ID);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    public void update_order_status_paid_to_processing_does_not_assign_mvd_without_confirm() {
        order.setStatus("PAID");
        order.setPaymentMethod("COD");
        order.setMvd(null);
        order.setOrderedDate(LocalDate.of(2026, 4, 28));
        order.setShippingAddress("TP.HCM");
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Order updated = orderService.updateOrderStatus(
                ORDER_ID,
                "PROCESSING",
                null,
                null,
                "shop"
        );

        assertEquals("PROCESSING", updated.getStatus());
        org.junit.Assert.assertNull(updated.getMvd());
        verify(orderRepository, never()).existsByMvd(any(String.class));
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    public void update_order_status_paid_to_confirmed_generates_mvd() {
        order.setStatus("PAID");
        order.setPaymentMethod("COD");
        order.setMvd(null);
        order.setOrderedDate(LocalDate.of(2026, 4, 28));
        order.setShippingAddress("TP.HCM");
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
        when(orderRepository.existsByMvd(any(String.class))).thenReturn(false);
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Order updated = orderService.updateOrderStatus(
                ORDER_ID,
                "CONFIRMED",
                null,
                null,
                "shop"
        );

        assertEquals("CONFIRMED", updated.getStatus());
        org.junit.Assert.assertNotNull(updated.getMvd());
        org.junit.Assert.assertNotNull(updated.getEstimatedDeliveryDate());
        verify(orderRepository, times(1)).existsByMvd(any(String.class));
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    public void update_payment_status_paid_does_not_change_order_fulfillment_status() {
        order.setStatus("PAYMENT_EXPECTED");
        order.setPaymentStatus("PENDING");
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer((invocation) -> invocation.getArgument(0));

        Order updated = orderService.updatePaymentStatus(ORDER_ID, "PAID", "SEPAY");

        assertEquals("PAYMENT_EXPECTED", updated.getStatus());
        assertEquals("PAID", updated.getPaymentStatus());
        assertEquals("SEPAY", updated.getPaymentMethod());
        verify(orderRepository, times(1)).findById(ORDER_ID);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    public void update_order_status_should_generate_mvd_when_confirmed() {
        order.setStatus("CREATED");
        order.setMvd(null);
        order.setOrderedDate(LocalDate.of(2026, 4, 28));
        order.setShippingAddress("TP.HCM");
        when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
        when(orderRepository.existsByMvd(any(String.class))).thenReturn(false);
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Order updated = orderService.updateOrderStatus(
                ORDER_ID,
                "CONFIRMED",
                null,
                null,
                "shop"
        );

        assertEquals("CONFIRMED", updated.getStatus());
        org.junit.Assert.assertNotNull(updated.getMvd());
        org.junit.Assert.assertNotNull(updated.getEstimatedDeliveryDate());
        assertEquals(LocalDate.of(2026, 4, 29), updated.getEstimatedDeliveryDate());
        verify(orderRepository, times(1)).existsByMvd(any(String.class));
        verify(orderRepository, times(1)).save(any(Order.class));
    }


}
