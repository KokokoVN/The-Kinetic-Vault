package com.rainbowforest.orderservice.config;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.OrderStatus;
import com.rainbowforest.orderservice.repository.OrderRepository;
import com.rainbowforest.orderservice.utilities.OrderEtaCalculator;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

@Component
@Profile("dev")
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class OrderDataInitializer implements CommandLineRunner {

    private final OrderRepository orderRepository;

    public OrderDataInitializer(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public void run(String... args) {
        // 20 orders sample for local testing (dev profile).
        seedOrderIfMissing(buildOrder("ORD-TEST-0001", LocalDate.now().minusDays(5), OrderStatus.CREATED, "PENDING", "COD",
                "12 Nguyen Hue, Quan 1, TP.HCM", null, "0001", 1L, "admin",
                newItem(1001L, 1, 189000), newItem(1002L, 2, 349000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0002", LocalDate.now().minusDays(4), OrderStatus.CONFIRMED, "PENDING", "BANK_TRANSFER",
                "35 Yen Phu, Ba Dinh, Ha Noi", "MVDTEST0002", "0002", 2L, "binh",
                newItem(1003L, 1, 599000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0003", LocalDate.now().minusDays(4), OrderStatus.SHIPPED, "PAID", "CARD",
                "88 Bach Dang, Hai Chau, Da Nang", "MVDTEST0003", "0003", 3L, "chi",
                newItem(1004L, 1, 429000), newItem(1005L, 1, 379000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0004", LocalDate.now().minusDays(3), OrderStatus.DELIVERED, "PAID", "COD",
                "10 Le Thanh Ton, Q1, TP.HCM", "MVDTEST0004", "0004", 4L, "dung",
                newItem(1006L, 2, 159000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0005", LocalDate.now().minusDays(2), OrderStatus.CANCELLED, "FAILED", "BANK_TRANSFER",
                "110 Vo Van Tan, TP.HCM", null, "0005", 5L, "ha",
                newItem(1007L, 1, 259000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0006", LocalDate.now().minusDays(2), OrderStatus.CONFIRMED, "PAID", "CARD",
                "3 Tran Phu, Nha Trang", "MVDTEST0006", "0006", 6L, "hoa",
                newItem(1008L, 1, 699000), newItem(1009L, 1, 99000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0007", LocalDate.now().minusDays(2), OrderStatus.CREATED, "PENDING", "COD",
                "72 Ho Tung Mau, Ha Noi", null, "0007", 7L, "khanh",
                newItem(1010L, 1, 499000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0008", LocalDate.now().minusDays(1), OrderStatus.CONFIRMED, "PAID", "BANK_TRANSFER",
                "9 Nguyen Van Linh, Can Tho", "MVDTEST0008", "0008", 8L, "lam",
                newItem(1011L, 2, 289000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0009", LocalDate.now().minusDays(1), OrderStatus.SHIPPED, "PAID", "COD",
                "14 Phan Chu Trinh, Hue", "MVDTEST0009", "0009", 9L, "minh",
                newItem(1012L, 1, 229000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0010", LocalDate.now().minusDays(1), OrderStatus.CREATED, "PENDING", "CARD",
                "66 Cach Mang Thang Tam, TP.HCM", null, "0010", 10L, "nga",
                newItem(1013L, 1, 119000), newItem(1014L, 1, 459000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0011", LocalDate.now(), OrderStatus.CONFIRMED, "PENDING", "COD",
                "101 Dien Bien Phu, Binh Thanh, TP.HCM", "MVDTEST0011", "0011", 11L, "nam",
                newItem(1001L, 1, 189000), newItem(1003L, 1, 599000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0012", LocalDate.now(), OrderStatus.CREATED, "PENDING", "BANK_TRANSFER",
                "20 Hai Ba Trung, Da Nang", null, "0012", 12L, "oanh",
                newItem(1006L, 1, 159000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0013", LocalDate.now().minusDays(6), OrderStatus.DELIVERED, "PAID", "CARD",
                "23 Ly Tu Trong, Q1, Sai Gon", "MVDTEST0013", "0013", 13L, "phuc",
                newItem(1002L, 1, 349000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0014", LocalDate.now().minusDays(7), OrderStatus.CONFIRMED, "PAID", "COD",
                "1 Hoang Dieu, Hai Chau, Da Nang", "MVDTEST0014", "0014", 14L, "quang",
                newItem(1005L, 2, 379000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0015", LocalDate.now().minusDays(8), OrderStatus.SHIPPED, "PAID", "BANK_TRANSFER",
                "15 Tran Hung Dao, Hoan Kiem, Ha Noi", "MVDTEST0015", "0015", 15L, "son",
                newItem(1014L, 1, 459000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0016", LocalDate.now().minusDays(9), OrderStatus.CREATED, "PENDING", "COD",
                "Long An", null, "0016", 16L, "thao",
                newItem(1011L, 1, 289000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0017", LocalDate.now().minusDays(10), OrderStatus.CONFIRMED, "PENDING", "CARD",
                "Bien Hoa, Dong Nai", "MVDTEST0017", "0017", 17L, "tien",
                newItem(1007L, 2, 259000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0018", LocalDate.now().minusDays(11), OrderStatus.SHIPPED, "PAID", "BANK_TRANSFER",
                "Thanh pho Vinh, Nghe An", "MVDTEST0018", "0018", 18L, "trang",
                newItem(1008L, 1, 699000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0019", LocalDate.now().minusDays(12), OrderStatus.DELIVERED, "PAID", "COD",
                "Hai Phong", "MVDTEST0019", "0019", 19L, "tuan",
                newItem(1009L, 3, 99000)));

        seedOrderIfMissing(buildOrder("ORD-TEST-0020", LocalDate.now().minusDays(13), OrderStatus.CANCELLED, "REFUNDED", "CARD",
                "Da Lat, Lam Dong", null, "0020", 20L, "vy",
                newItem(1010L, 1, 499000)));

        // Linked demo dataset for userId=19 (cart/order/variant integration testing)
        seedOrderIfMissing(buildOrder("ORD-U19-0001", LocalDate.now().minusDays(3), OrderStatus.DELIVERED, "PAID", "COD",
                "19 Nguyen Trai, Q1, TP.HCM", "U19MVD0001", "0919", 19L, "user19",
                newItem(1L, 1L, "M - Black", 1, 189000),
                newItem(2L, 2L, "42 - White", 1, 599000)));

        seedOrderIfMissing(buildOrder("ORD-U19-0002", LocalDate.now().minusDays(1), OrderStatus.SHIPPED, "PAID", "BANK_TRANSFER",
                "19 Nguyen Trai, Q1, TP.HCM", "U19MVD0002", "0919", 19L, "user19",
                newItem(3L, 3L, "15 inch - Gray", 1, 499000)));

        seedOrderIfMissing(buildOrder("ORD-U19-0003", LocalDate.now(), OrderStatus.CREATED, "PENDING", "COD",
                "19 Nguyen Trai, Q1, TP.HCM", null, "0919", 19L, "user19",
                newItem(1L, 1L, "M - Black", 2, 189000)));
    }

    private void seedOrderIfMissing(Order order) {
        if (order == null || order.getOrderNumber() == null) {
            return;
        }
        if (!orderRepository.existsByOrderNumber(order.getOrderNumber())) {
            orderRepository.save(order);
        }
    }

    private Order buildOrder(
            String orderNumber,
            LocalDate orderedDate,
            OrderStatus status,
            String paymentStatus,
            String paymentMethod,
            String shippingAddress,
            String mvd,
            String phoneLast4,
            Long userId,
            String userName,
            Item... items
    ) {
        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setOrderedDate(orderedDate);
        order.setStatus(status.name());
        order.setPaymentStatus(paymentStatus);
        order.setPaymentMethod(paymentMethod);
        order.setShippingAddress(shippingAddress);
        order.setMvd(mvd);
        order.setPhoneLast4(phoneLast4);
        if (mvd != null && !mvd.trim().isEmpty()) {
            order.setEstimatedDeliveryDate(OrderEtaCalculator.calculate(orderedDate, shippingAddress));
        }

        order.setUserId(userId);
        order.setUserName(userName);

        order.setItems(Arrays.asList(items));
        BigDecimal total = BigDecimal.ZERO;
        for (Item item : items) {
            total = total.add(item.getSubTotal());
        }
        order.setTotal(total);
        return order;
    }

    private Item newItem(Long productId, int quantity, int unitPrice) {
        Item item = new Item();
        item.setProductId(productId);
        item.setQuantity(quantity);
        item.setSubTotal(BigDecimal.valueOf((long) quantity * unitPrice));
        return item;
    }

    private Item newItem(Long productId, Long variantId, String variantLabel, int quantity, int unitPrice) {
        Item item = newItem(productId, quantity, unitPrice);
        item.setVariantId(variantId);
        item.setVariantLabel(variantLabel);
        return item;
    }
}

