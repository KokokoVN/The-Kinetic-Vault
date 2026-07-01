package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.OrderStatus;
import com.rainbowforest.orderservice.domain.PaymentStatus;
import com.rainbowforest.orderservice.feignclient.InventoryClient;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.feignclient.ProductClient;
import com.rainbowforest.orderservice.repository.OrderRepository;
import com.rainbowforest.orderservice.utilities.OrderEtaCalculator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InventoryClient inventoryClient;

    @Autowired
    private UserClient userClient;

    @Autowired
    private ProductClient productClient;

    @Override
    public Order saveOrder(Order order) {
        return orderRepository.save(Objects.requireNonNull(order));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(Objects.requireNonNull(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> getOrderByMvdAndPhoneLast4(String mvd, String phoneLast4) {
        return orderRepository.findByMvdAndPhoneLast4(
                Objects.requireNonNull(mvd),
                Objects.requireNonNull(phoneLast4)
        );
    }

    @Override
    public Order updatePaymentStatus(Long id, String paymentStatus, String paymentMethod) {
        Order row = orderRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng " + id));
        PaymentStatus normalizedPaymentStatus = PaymentStatus.fromNullable(paymentStatus);
        if (normalizedPaymentStatus == null) {
            throw new IllegalArgumentException("Unsupported payment status: " + paymentStatus);
        }
        
        PaymentStatus currentPaymentStatus = PaymentStatus.fromNullable(row.getPaymentStatus());
        if (currentPaymentStatus == null) {
            currentPaymentStatus = PaymentStatus.PENDING;
        }
        validatePaymentTransition(currentPaymentStatus, normalizedPaymentStatus);
        
        row.setPaymentStatus(normalizedPaymentStatus.name());
        if (paymentMethod != null && !paymentMethod.trim().isEmpty()) {
            row.setPaymentMethod(paymentMethod.trim().toUpperCase(Locale.ROOT));
        }
        // Trạng thái xử lý đơn (CREATED / PAYMENT_EXPECTED / CONFIRMED / PROCESSING / …) chỉ đổi qua
        // PATCH /orders/{id}/status (admin). Thanh toán thành công chỉ cập nhật payment_status.
        return orderRepository.save(row);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> listOrders(Long userId, String status, String paymentStatus, String q, String startDate, String endDate) {
        return orderRepository.findAll(buildSpecification(userId, status, paymentStatus, q, startDate, endDate),
                Sort.by(Sort.Direction.DESC, "orderedDate", "id"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> searchOrders(Long userId, String status, String paymentStatus, String q, String startDate, String endDate, int page, int size) {
        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.max(1, Math.min(size, 200));
        return orderRepository.findAll(
                buildSpecification(userId, status, paymentStatus, q, startDate, endDate),
                PageRequest.of(normalizedPage, normalizedSize, Sort.by(Sort.Direction.DESC, "orderedDate", "id"))
        );
    }

    @Override
    public Order updateOrderStatus(Long id, String status, String paymentStatus, String shippingAddress, String performedBy) {
        Order row = orderRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng " + id));
        OrderStatus targetOrderStatus = OrderStatus.from(status);
        OrderStatus currentOrderStatus = normalizeCurrentStatus(row.getStatus());
        validateTransition(currentOrderStatus, targetOrderStatus);
        row.setStatus(targetOrderStatus.name());

        // Payment status is derived from payment flow (DB/service), not editable in this endpoint.
        if (shippingAddress != null && !shippingAddress.trim().isEmpty()) {
            row.setShippingAddress(shippingAddress.trim());
        }
        boolean isNowConfirmed = (targetOrderStatus == OrderStatus.CONFIRMED) && (currentOrderStatus != OrderStatus.CONFIRMED);
        boolean hadEmptyMvd = row.getMvd() == null || row.getMvd().trim().isEmpty();

        // MVD chỉ sinh khi shop xác nhận đơn (chuyển sang CONFIRMED), gồm cả lộ trình PAID → CONFIRMED.
        if (hadEmptyMvd && isNowConfirmed) {
            row.setMvd(generateUniqueMvd());
        }
        if (isNowConfirmed) {
            row.setEstimatedDeliveryDate(OrderEtaCalculator.calculate(row.getOrderedDate(), row.getShippingAddress()));
            // Admin requested: allow confirm without stock quantity validation.
            // Inventory deduction/check is skipped on confirm flow.
        } else if (shippingAddress != null && !shippingAddress.trim().isEmpty()) {
            // If shop updates address after confirm, recompute ETA (unless already delivered/cancelled)
            OrderStatus normalized = normalizeCurrentStatus(row.getStatus());
            if (normalized != OrderStatus.DELIVERED && normalized != OrderStatus.CANCELLED
                    && row.getEstimatedDeliveryDate() != null) {
                row.setEstimatedDeliveryDate(OrderEtaCalculator.calculate(row.getOrderedDate(), row.getShippingAddress()));
            }
        }

        // Tự động xuất kho khi đơn hàng bắt đầu giao (SHIPPED)
        if (targetOrderStatus == OrderStatus.SHIPPED && currentOrderStatus != OrderStatus.SHIPPED) {
            deductInventory(row, performedBy);
        }

        // Cập nhật thanh toán và lượt bán khi đơn hàng hoàn thành (DELIVERED)
        if (targetOrderStatus == OrderStatus.DELIVERED && currentOrderStatus != OrderStatus.DELIVERED) {
            // Cập nhật lượt bán
            if (row.getItems() != null) {
                for (Item item : row.getItems()) {
                    if (item.getProductId() != null && item.getQuantity() > 0) {
                        try {
                            productClient.incrementSalesCount(item.getProductId(), item.getQuantity());
                        } catch (Exception e) {
                            // Bỏ qua nếu lỗi kết nối
                        }
                    }
                }
            }

            row.setPaymentStatus(PaymentStatus.PAID.name());
            
            // Cập nhật thống kê chi tiêu cho người dùng
            try {
                userClient.updateUserStats(row.getUserId(), new com.rainbowforest.orderservice.dto.UserStatsUpdateRequest(row.getTotal(), 1L));
            } catch (Exception e) {
                // Ignore if user-service is down
            }
        } else if (currentOrderStatus == OrderStatus.DELIVERED && targetOrderStatus != OrderStatus.DELIVERED) {
            // Hủy/Hoàn trả đơn hàng đã giao -> Trừ thống kê chi tiêu
            try {
                java.math.BigDecimal negativeTotal = row.getTotal() != null ? row.getTotal().negate() : java.math.BigDecimal.ZERO;
                userClient.updateUserStats(row.getUserId(), new com.rainbowforest.orderservice.dto.UserStatsUpdateRequest(negativeTotal, -1L));
            } catch (Exception e) {
                // Ignore if user-service is down
            }
        }

        if (performedBy != null && !performedBy.trim().isEmpty()) {
            row.setUpdatedBy(performedBy.trim());
        }
        return orderRepository.save(row);
    }

    private void deductInventory(Order order, String performedBy) {
        if (order.getItems() != null) {
            for (Item item : order.getItems()) {
                InventoryClient.StockOperationRequest req = new InventoryClient.StockOperationRequest();
                req.setProductId(item.getProductId());
                req.setVariantId(item.getVariantId());
                req.setQuantity(item.getQuantity());
                req.setReferenceType("ORDER");
                req.setReferenceId(order.getId());
                req.setNote("Xuất kho tự động cho đơn hàng " + order.getOrderNumber());
                req.setMovementAt(LocalDateTime.now());
                req.setPerformedBy(performedBy != null ? performedBy : "system");
                
                try {
                    inventoryClient.outbound(req);
                } catch (Exception e) {
                    throw new IllegalStateException("Không thể xuất kho cho sản phẩm " + item.getProductId() + 
                            (item.getVariantId() != null ? " (Biến thể " + item.getVariantId() + ")" : "") + 
                            ". Tồn kho không đủ hoặc lỗi kết nối tới Inventory Service.", e);
                }
            }
        }
    }

    private OrderStatus normalizeCurrentStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.trim().isEmpty()) {
            return OrderStatus.CREATED;
        }
        return OrderStatus.from(rawStatus);
    }

    private void validateTransition(OrderStatus from, OrderStatus to) {
        if (from == to) {
            return;
        }
        Map<OrderStatus, EnumSet<OrderStatus>> transitionMap = buildTransitionMap();
        EnumSet<OrderStatus> allowedTargets = transitionMap.get(from);
        if (allowedTargets == null || !allowedTargets.contains(to)) {
            throw new IllegalArgumentException(
                    "Invalid order status transition: " + from.name() + " -> " + to.name()
            );
        }
    }

    private void validatePaymentTransition(PaymentStatus from, PaymentStatus to) {
        if (from == to) {
            return;
        }
        if (from == PaymentStatus.PAID && to != PaymentStatus.REFUNDED) {
            throw new IllegalArgumentException("Cannot change payment status from PAID to " + to.name());
        }
        if (from == PaymentStatus.FAILED || from == PaymentStatus.REFUNDED) {
            throw new IllegalArgumentException("Payment status is final and cannot be changed from " + from.name());
        }
    }

    private Map<OrderStatus, EnumSet<OrderStatus>> buildTransitionMap() {
        return Arrays.stream(OrderStatus.values()).collect(Collectors.toMap(
                value -> value,
                value -> {
                    switch (value) {
                        case CREATED:
                            return EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED);
                        case CONFIRMED:
                            return EnumSet.of(OrderStatus.PACKING, OrderStatus.PROCESSING, OrderStatus.READY_TO_SHIP, OrderStatus.SHIPPED, OrderStatus.CANCELLED);
                        case PAYMENT_EXPECTED:
                            return EnumSet.of(OrderStatus.PAID, OrderStatus.CANCELLED);
                        case PAID:
                            return EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.CANCELLED);
                        case PROCESSING:
                            return EnumSet.of(OrderStatus.PACKING, OrderStatus.READY_TO_SHIP, OrderStatus.SHIPPED, OrderStatus.CANCELLED);
                        case PACKING:
                            return EnumSet.of(OrderStatus.READY_TO_SHIP, OrderStatus.SHIPPED, OrderStatus.CANCELLED);
                        case READY_TO_SHIP:
                            return EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED);
                        case SHIPPED:
                            return EnumSet.of(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERY_FAILED, OrderStatus.RESCHEDULED, OrderStatus.DELIVERED);
                        case OUT_FOR_DELIVERY:
                            return EnumSet.of(OrderStatus.DELIVERY_FAILED, OrderStatus.RESCHEDULED, OrderStatus.REFUSED, OrderStatus.DELIVERED);
                        case DELIVERY_FAILED:
                            return EnumSet.of(OrderStatus.RESCHEDULED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.RETURNING, OrderStatus.CANCELLED);
                        case RESCHEDULED:
                            return EnumSet.of(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERY_FAILED, OrderStatus.REFUSED, OrderStatus.DELIVERED, OrderStatus.CANCELLED);
                        case REFUSED:
                            return EnumSet.of(OrderStatus.RETURNING, OrderStatus.CANCELLED);
                        case RETURNING:
                            return EnumSet.of(OrderStatus.RETURNED);
                        case RETURNED:
                            return EnumSet.noneOf(OrderStatus.class);
                        case DELIVERED:
                        case CANCELLED:
                        default:
                            return EnumSet.noneOf(OrderStatus.class);
                    }
                }
        ));
    }

    private String generateUniqueMvd() {
        String mvd;
        do {
            mvd = "MVD" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase(Locale.ROOT);
        } while (orderRepository.existsByMvd(mvd));
        return mvd;
    }

    private Specification<Order> buildSpecification(Long userId, String status, String paymentStatus, String q, String startDate, String endDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (startDate != null && !startDate.trim().isEmpty()) {
                try {
                    LocalDate start = LocalDate.parse(startDate.trim());
                    predicates.add(cb.greaterThanOrEqualTo(root.get("orderedDate"), start));
                } catch (Exception ignored) {}
            }
            if (endDate != null && !endDate.trim().isEmpty()) {
                try {
                    LocalDate end = LocalDate.parse(endDate.trim());
                    predicates.add(cb.lessThanOrEqualTo(root.get("orderedDate"), end));
                } catch (Exception ignored) {}
            }

            if (userId != null) {
                predicates.add(cb.equal(root.get("userId"), Objects.requireNonNull(userId)));
            }
            if (status != null && !status.trim().isEmpty()) {
                String normalizedStatus = OrderStatus.from(status).name();
                predicates.add(cb.equal(cb.upper(root.get("status")), normalizedStatus.toUpperCase(Locale.ROOT)));
            }
            if (paymentStatus != null && !paymentStatus.trim().isEmpty()) {
                String normalizedPaymentStatus = PaymentStatus.fromNullable(paymentStatus).name();
                predicates.add(cb.equal(
                        cb.upper(root.get("paymentStatus")),
                        normalizedPaymentStatus.toUpperCase(Locale.ROOT)
                ));
            }
            if (q != null && !q.trim().isEmpty()) {
                String key = "%" + q.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("orderNumber")), key),
                        cb.like(cb.lower(root.get("mvd")), key),
                        cb.like(cb.lower(root.get("shippingAddress")), key),
                        cb.like(cb.lower(root.get("userName")), Objects.requireNonNull(key))
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
