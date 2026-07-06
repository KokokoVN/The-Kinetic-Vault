package com.rainbowforest.orderservice.controller;

import com.rainbowforest.activitylog.ActivityLogPublisher;
import com.rainbowforest.orderservice.dto.OrderStatusUpdateRequest;
import com.rainbowforest.orderservice.dto.OrderSearchPageResponse;
import com.rainbowforest.orderservice.dto.ManualOrderCreateRequest;
import com.rainbowforest.orderservice.dto.CodCheckoutRequest;
import com.rainbowforest.orderservice.dto.PaymentStatusUpdateRequest;
import com.rainbowforest.orderservice.dto.OrderCheckoutCodResponse;
import com.rainbowforest.orderservice.dto.ReviewOrderDto;
import com.rainbowforest.orderservice.dto.ReviewOrderItemDto;
import com.rainbowforest.orderservice.dto.SendNotificationRequest;
import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.OrderStatus;
import com.rainbowforest.orderservice.domain.PaymentMethod;
import com.rainbowforest.orderservice.domain.PaymentStatus;
import com.rainbowforest.orderservice.domain.Product;
import com.rainbowforest.orderservice.domain.ProductVariant;
import com.rainbowforest.orderservice.feignclient.ProductClient;
import com.rainbowforest.orderservice.feignclient.CartClient;
import com.rainbowforest.orderservice.feignclient.PaymentClient;
import com.rainbowforest.orderservice.feignclient.NotificationClient;
import com.rainbowforest.orderservice.feignclient.TelegramClient;
import com.rainbowforest.orderservice.client.SaleClient;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.feignclient.UserClientResponse;
import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.utilities.OrderUtilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Locale;
import javax.validation.Valid;

@RestController
public class OrderController {

    @Autowired
    private UserClient userClient;

    @Autowired
    private SaleClient saleClient;

    @Autowired
    private ProductClient productClient;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartClient cartClient;

    @Autowired
    private PaymentClient paymentClient;

    @Autowired
    private NotificationClient notificationClient;

    @Autowired
    private TelegramClient telegramClient;

    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private ActivityLogPublisher activityLogPublisher;
    
    @PostMapping(value = "/order/{userId}")
    public ResponseEntity<?> saveOrder(
    		@PathVariable("userId") Long userId,
    		@RequestHeader(value = "Cookie") String cartId,
    		HttpServletRequest request){
    	
        List<Item> cart = null;
        try {
            cart = cartClient.getCart(cartId);
        } catch (Exception ignored) {
            // Cart service unavailable or cart not found.
        }
        UserClientResponse user = userClient.getUserById(userId);
        if(cart != null && user != null) {
        	Order order = this.createOrder(cart, user);
        	try{
                orderService.saveOrder(order);
                deductInventoryAndSaleQuantity(order, user.getUserName());
                try {
                    cartClient.clearCart(cartId);
                } catch (Exception ignored) {
                    // Keep order success even if cart clean-up fails.
                }
                Map<String, Object> after = new LinkedHashMap<>();
                after.put("orderId", order.getId());
                after.put("orderNumber", order.getOrderNumber());
                after.put("total", order.getTotal() != null ? order.getTotal().toPlainString() : null);
                after.put("status", order.getStatus());
                after.put("paymentStatus", order.getPaymentStatus());
                after.put("paymentMethod", order.getPaymentMethod());
                after.put("mvd", order.getMvd());
                after.put("estimatedDeliveryDate", order.getEstimatedDeliveryDate());
                after.put("itemCount", cart != null ? cart.size() : 0);
                Map<String, Object> detail = new LinkedHashMap<>();
                detail.put("resourceType", "Order");
                detail.put("after", after);
                activityLogPublisher.publish(
                        "order-service",
                        "ORDER_CREATE",
                        "Order",
                        String.valueOf(order.getId()),
                        "POST",
                        "/order/" + userId,
                        detail,
                        user.getUserName(),
                        String.valueOf(userId));
                enrichOrderProductDetails(order);
                tryNotifyTelegram(order, null);
                return new ResponseEntity<Order>(
                		order, 
                		headerGenerator.getHeadersForSuccessPostMethod(request, order.getId()),
                		HttpStatus.CREATED);
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().body(ex.getMessage());
            } catch (Exception ex) {
                ex.printStackTrace();
                return new ResponseEntity<String>(
                        "Lỗi hệ thống: " + ex.getMessage(),
                        headerGenerator.getHeadersForError(),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
  
        return new ResponseEntity<Order>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/orders")
    public ResponseEntity<List<Order>> listOrders(
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "paymentStatus", required = false) String paymentStatus,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) {
        List<Order> rows = orderService.listOrders(userId, status, paymentStatus, q, startDate, endDate);
        for (Order row : rows) {
            enrichOrderProductDetails(row);
        }
        return new ResponseEntity<List<Order>>(
                rows,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @GetMapping(value = "/users/{userId}/orders")
    public ResponseEntity<List<Order>> listOrdersByUser(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "paymentStatus", required = false) String paymentStatus,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) {
        List<Order> rows = orderService.listOrders(userId, status, paymentStatus, q, startDate, endDate);
        for (Order row : rows) {
            enrichOrderProductDetails(row);
        }
        return new ResponseEntity<List<Order>>(
                rows,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @GetMapping(value = "/orders/page")
    public ResponseEntity<OrderSearchPageResponse> searchOrders(
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "paymentStatus", required = false) String paymentStatus,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size
    ) {
        Page<Order> rows = orderService.searchOrders(userId, status, paymentStatus, q, startDate, endDate, page, size);
        for (Order row : rows.getContent()) {
            enrichOrderProductDetails(row);
        }
        OrderSearchPageResponse out = new OrderSearchPageResponse();
        out.setItems(rows.getContent());
        out.setPage(rows.getNumber());
        out.setSize(rows.getSize());
        out.setTotalItems(rows.getTotalElements());
        out.setTotalPages(rows.getTotalPages());
        return new ResponseEntity<OrderSearchPageResponse>(
                out,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @GetMapping(value = "/orders/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable("id") Long id) {
        Optional<Order> row = orderService.getOrderById(id);
        if (row.isPresent()) {
            enrichOrderProductDetails(row.get());
            return new ResponseEntity<Order>(
                    row.get(),
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK
            );
        }
        return new ResponseEntity<Order>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND
        );
    }

    @GetMapping(value = "/orders/{id}/review-check")
    public ResponseEntity<ReviewOrderDto> getOrderForReview(@PathVariable("id") Long id) {
        Optional<Order> row = orderService.getOrderById(id);
        if (!row.isPresent()) {
            return new ResponseEntity<ReviewOrderDto>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND
            );
        }

        Order order = row.get();
        ReviewOrderDto dto = new ReviewOrderDto();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setOrderStatus(order.getStatus());
        dto.setOrderItems(order.getItems() == null ? new ArrayList<>() : order.getItems().stream().map(item -> {
            ReviewOrderItemDto itemDto = new ReviewOrderItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProductId());
            itemDto.setVariantId(item.getVariantId());
            itemDto.setQuantity(item.getQuantity());
            return itemDto;
        }).collect(Collectors.toList()));

        return new ResponseEntity<ReviewOrderDto>(
                dto,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @GetMapping(value = "/orders/check")
    public ResponseEntity<Order> checkOrderByMvd(
            @RequestParam("mvd") String mvd,
            @RequestParam("phoneLast4") String phoneLast4
    ) {
        String normalizedMvd = mvd == null ? "" : mvd.trim();
        String normalizedPhoneLast4 = normalizePhoneLast4(phoneLast4);
        if (normalizedMvd.isEmpty() || normalizedPhoneLast4 == null) {
            return new ResponseEntity<Order>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST
            );
        }
        Optional<Order> row = orderService.getOrderByMvdAndPhoneLast4(normalizedMvd, normalizedPhoneLast4);
        if (row.isPresent()) {
            enrichOrderProductDetails(row.get());
            return new ResponseEntity<Order>(
                    row.get(),
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK
            );
        }
        return new ResponseEntity<Order>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND
        );
    }

    @PostMapping(value = "/admin/orders/sync-user-stats")
    public ResponseEntity<String> syncUserStats() {
        try {
            List<Order> deliveredOrders = orderService.listOrders(null, "DELIVERED", null, null, null, null);
            Map<Long, java.math.BigDecimal> userTotalMap = new java.util.HashMap<>();
            Map<Long, Long> userCountMap = new java.util.HashMap<>();
            for (Order o : deliveredOrders) {
                Long uid = o.getUserId();
                if (uid == null) continue;
                userCountMap.put(uid, userCountMap.getOrDefault(uid, 0L) + 1L);
                java.math.BigDecimal t = o.getTotal() != null ? o.getTotal() : java.math.BigDecimal.ZERO;
                userTotalMap.put(uid, userTotalMap.getOrDefault(uid, java.math.BigDecimal.ZERO).add(t));
            }
            int updated = 0;
            for (Long uid : userCountMap.keySet()) {
                try {
                    com.rainbowforest.orderservice.dto.UserStatsUpdateRequest req = new com.rainbowforest.orderservice.dto.UserStatsUpdateRequest();
                    req.setTotalSpentToAdd(userTotalMap.get(uid));
                    req.setCompletedOrdersToAdd(userCountMap.get(uid));
                    userClient.setExactUserStats(uid, req);
                    updated++;
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            return new ResponseEntity<String>("Synced " + updated + " users.", HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<String>("Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/orders/manual")
    public ResponseEntity<?> createManualOrder(
            @Valid @RequestBody ManualOrderCreateRequest req,
            HttpServletRequest request
    ) {
        if (req == null || req.getUserId() == null || req.getItems() == null || req.getItems().isEmpty()) {
            return new ResponseEntity<Order>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST
            );
        }
        UserClientResponse user = userClient.getUserById(req.getUserId());
        if (user == null) {
            return new ResponseEntity<Order>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND
            );
        }
        try {
            List<Item> items = new java.util.ArrayList<>();
            for (ManualOrderCreateRequest.LineItem line : req.getItems()) {
                if (line == null || line.getProductId() == null || line.getQuantity() == null || line.getQuantity() <= 0) {
                    return new ResponseEntity<Order>(
                            headerGenerator.getHeadersForError(),
                            HttpStatus.BAD_REQUEST
                    );
                }
                Product product = fetchProductWithAdminFallback(line.getProductId());
                Item item = new Item();
                item.setProductId(line.getProductId());
                item.setProduct(product);
                item.setQuantity(line.getQuantity());
                java.math.BigDecimal unitPrice = resolveUnitPrice(line.getProductId(), line.getVariantId(), product);
                item.setSubTotal(unitPrice == null
                        ? java.math.BigDecimal.ZERO
                        : unitPrice.multiply(java.math.BigDecimal.valueOf(line.getQuantity().longValue())));
                item.setVariantId(line.getVariantId());
                item.setVariantLabel(line.getVariantLabel());
                items.add(item);
            }
            Order order = this.createOrder(items, user);
            applyVoucherIfAny(order, req.getVoucherCode(), user.getId());
            if (req.getShippingAddress() != null && !req.getShippingAddress().trim().isEmpty()) {
                String shippingAddress = req.getShippingAddress().trim();
                order.setShippingAddress(shippingAddress);
                String phoneLast4 = extractPhoneLast4(
                        user,
                        shippingAddress,
                        req.getPhoneNumber() != null ? req.getPhoneNumber().trim() : null
                );
                if (phoneLast4 != null) {
                    order.setPhoneLast4(phoneLast4);
                    order.setOrderNumber(generateReadableOrderNumber(phoneLast4));
                }
            }
            if (req.getPaymentMethod() != null && !req.getPaymentMethod().trim().isEmpty()) {
                try {
                    PaymentMethod method = PaymentMethod.fromNullable(req.getPaymentMethod());
                    if (method != null) {
                        order.setPaymentMethod(method.name());
                        // Non-COD flows (e.g. SePay QR) should stay in waiting-payment state
                        // until payment-service confirms PAID.
                        if (method != PaymentMethod.COD) {
                            order.setPaymentStatus(PaymentStatus.PENDING.name());
                            order.setStatus(OrderStatus.PAYMENT_EXPECTED.name());
                        }
                    }
                } catch (IllegalArgumentException ignored) {
                    // Keep default COD for invalid input.
                }
            }
            orderService.saveOrder(order);
            deductInventoryAndSaleQuantity(order, user.getUserName());
            Map<String, Object> after = new LinkedHashMap<>();
            after.put("orderId", order.getId());
            after.put("orderNumber", order.getOrderNumber());
            after.put("userId", order.getUserId());
            after.put("total", order.getTotal() != null ? order.getTotal().toPlainString() : null);
            after.put("status", order.getStatus());
            after.put("paymentStatus", order.getPaymentStatus());
            after.put("paymentMethod", order.getPaymentMethod());
            after.put("itemCount", items.size());
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("resourceType", "Order");
            detail.put("after", after);
            activityLogPublisher.publish(
                    "order-service",
                    "ORDER_MANUAL_CREATE",
                    "Order",
                    String.valueOf(order.getId()),
                    "POST",
                    "/orders/manual",
                    detail,
                    user.getUserName(),
                    req.getUserId() != null ? String.valueOf(req.getUserId()) : null
            );
            enrichOrderProductDetails(order);
            if (order.getPaymentMethod() != null
                    && PaymentMethod.SEPAY.name().equalsIgnoreCase(order.getPaymentMethod().trim())) {
                trySendSepayQrOrderEmail(user, order);
            }
            tryNotifyTelegram(order, req.getPhoneNumber() != null ? req.getPhoneNumber().trim() : null);
            return new ResponseEntity<Order>(
                    order,
                    headerGenerator.getHeadersForSuccessPostMethod(request, order.getId()),
                    HttpStatus.CREATED
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<String>(
                    "Lỗi hệ thống: " + e.getMessage(),
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @PostMapping(value = "/orders/checkout/cod/buy-now")
    public ResponseEntity<OrderCheckoutCodResponse> checkoutCodBuyNow(
            @Valid @RequestBody CodCheckoutRequest req,
            @RequestHeader(value = "Cookie", required = false) String cartId,
            HttpServletRequest request
    ) {
        if (req == null || req.getUserId() == null || req.getBuyNowItem() == null
                || req.getBuyNowItem().getProductId() == null
                || req.getBuyNowItem().getQuantity() == null
                || req.getBuyNowItem().getQuantity() <= 0) {
            return new ResponseEntity<OrderCheckoutCodResponse>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
        }
        UserClientResponse user = userClient.getUserById(req.getUserId());
        if (user == null) {
            return new ResponseEntity<OrderCheckoutCodResponse>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        }
        try {
            List<Item> items = new ArrayList<>();
            items.add(buildItem(
                    req.getBuyNowItem().getProductId(),
                    req.getBuyNowItem().getQuantity(),
                    req.getBuyNowItem().getVariantId(),
                    req.getBuyNowItem().getVariantLabel()
            ));
            Order order = buildCodOrder(items, user, req.getShippingAddress(), req.getPhoneNumber());
            applyVoucherIfAny(order, req.getVoucherCode(), user.getId());
            Order saved = orderService.saveOrder(order);
            deductInventoryAndSaleQuantity(saved, user.getUserName());
            createCodPayment(saved);
            if (cartId != null && !cartId.trim().isEmpty()) {
                CartClient.RemoveSelectedRequest removeSelectedRequest = new CartClient.RemoveSelectedRequest();
                removeSelectedRequest.items = new ArrayList<>();
                CodCheckoutRequest.SelectedCartItem selected = new CodCheckoutRequest.SelectedCartItem();
                selected.setProductId(req.getBuyNowItem().getProductId());
                Long buyNowVariantId = req.getBuyNowItem().getVariantId();
                selected.setVariantId((buyNowVariantId != null && buyNowVariantId > 0) ? buyNowVariantId : null);
                selected.setQuantity(req.getBuyNowItem().getQuantity());
                selected.setVariantLabel(req.getBuyNowItem().getVariantLabel());
                removeSelectedRequest.items.add(selected);
                try {
                    cartClient.removeSelectedViaPost(cartId, removeSelectedRequest);
                } catch (Exception ignored) {
                    // Keep order success even when cart clean-up fails.
                }
            }
            enrichOrderProductDetails(saved);
            trySendOrderEmail(user, saved);
            tryNotifyTelegram(saved, req.getPhoneNumber() != null ? req.getPhoneNumber().trim() : null);
            return new ResponseEntity<OrderCheckoutCodResponse>(
                    toCodCheckoutResponse(saved),
                    headerGenerator.getHeadersForSuccessPostMethod(request, saved.getId()),
                    HttpStatus.CREATED
            );
        } catch (Exception ex) {
            ex.printStackTrace();
            OrderCheckoutCodResponse out = new OrderCheckoutCodResponse();
            out.setError("COD_CHECKOUT_FAILED");
            out.setMessage(ex.getMessage() != null ? ex.getMessage() : "Unexpected error during COD checkout (buy-now).");
            return new ResponseEntity<OrderCheckoutCodResponse>(out, headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/orders/checkout/cod/cart")
    public ResponseEntity<OrderCheckoutCodResponse> checkoutCodFromCart(
            @Valid @RequestBody CodCheckoutRequest req,
            @RequestHeader(value = "Cookie") String cartId,
            HttpServletRequest request
    ) {
        if (req == null || req.getUserId() == null || req.getSelectedCartItems() == null || req.getSelectedCartItems().isEmpty()) {
            return new ResponseEntity<OrderCheckoutCodResponse>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
        }
        UserClientResponse user = userClient.getUserById(req.getUserId());
        if (user == null) {
            return new ResponseEntity<OrderCheckoutCodResponse>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        }
        try {
            List<Item> cartItems = null;
            try {
                cartItems = cartClient.getCart(cartId);
            } catch (Exception ignored) {
                // fallback to request payload when cart-service returns 404 for cart endpoint
            }
            List<Item> selectedItems;
            if (cartItems == null || cartItems.isEmpty()) {
                selectedItems = buildSelectedItemsFromRequest(req.getSelectedCartItems());
            } else {
                selectedItems = collectSelectedItems(cartItems, req.getSelectedCartItems());
            }
            if (selectedItems.isEmpty()) {
                return new ResponseEntity<OrderCheckoutCodResponse>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
            }
            Order order = buildCodOrder(selectedItems, user, req.getShippingAddress(), req.getPhoneNumber());
            applyVoucherIfAny(order, req.getVoucherCode(), user.getId());
            Order saved = orderService.saveOrder(order);
            deductInventoryAndSaleQuantity(saved, user.getUserName());
            createCodPayment(saved);
            CartClient.RemoveSelectedRequest removeSelectedRequest = new CartClient.RemoveSelectedRequest();
            removeSelectedRequest.items = normalizeSelectedForCartRemoval(req.getSelectedCartItems());
            try {
                cartClient.removeSelectedViaPost(cartId, removeSelectedRequest);
            } catch (Exception ignored) {
                // Keep order success even when cart clean-up fails.
            }
            enrichOrderProductDetails(saved);
            trySendOrderEmail(user, saved);
            tryNotifyTelegram(saved, null);
            return new ResponseEntity<OrderCheckoutCodResponse>(
                    toCodCheckoutResponse(saved),
                    headerGenerator.getHeadersForSuccessPostMethod(request, saved.getId()),
                    HttpStatus.CREATED
            );
        } catch (Exception ex) {
            ex.printStackTrace();
            OrderCheckoutCodResponse out = new OrderCheckoutCodResponse();
            out.setError("COD_CHECKOUT_FAILED");
            out.setMessage(ex.getMessage() != null ? ex.getMessage() : "Unexpected error during COD checkout (cart).");
            return new ResponseEntity<OrderCheckoutCodResponse>(out, headerGenerator.getHeadersForError(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/orders/{id}/status", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody OrderStatusUpdateRequest req
    ) {
        try {
            String requestedStatus = req.getStatus() != null ? req.getStatus().trim() : "";
            Order row = orderService.updateOrderStatus(
                    id,
                    requestedStatus,
                    req.getPaymentStatus(),
                    req.getShippingAddress(),
                    req.getPerformedBy()
            );
            Map<String, Object> after = new LinkedHashMap<>();
            after.put("status", row.getStatus());
            after.put("paymentStatus", row.getPaymentStatus());
            after.put("paymentMethod", row.getPaymentMethod());
            after.put("shippingAddress", row.getShippingAddress());
            after.put("mvd", row.getMvd());
            after.put("estimatedDeliveryDate", row.getEstimatedDeliveryDate());
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("resourceType", "Order");
            detail.put("after", after);
            activityLogPublisher.publish(
                    "order-service",
                    "ORDER_STATUS_UPDATE",
                    "Order",
                    String.valueOf(row.getId()),
                    "PATCH",
                    "/orders/" + id + "/status",
                    detail,
                    req.getPerformedBy(),
                    null
            );
            boolean isConfirmRequest = OrderStatus.CONFIRMED.name().equalsIgnoreCase(requestedStatus);
            if (isConfirmRequest) {
                trySendOrderConfirmedNotification(row, req.getPerformedBy());
            }
            return new ResponseEntity<Order>(
                    row,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK
            );
        } catch (NoSuchElementException e) {
            return new ResponseEntity<Order>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND
            );
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<Order>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    /** POST is used by payment-service Feign (PATCH is unreliable with JDK HttpURLConnection on Java 8). */
    @RequestMapping(value = "/orders/{id}/payment-status", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<Order> updateOrderPaymentStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody PaymentStatusUpdateRequest req
    ) {
        try {
            Order row = orderService.updatePaymentStatus(id, req.getPaymentStatus(), req.getPaymentMethod());
            return new ResponseEntity<Order>(
                    row,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK
            );
        } catch (NoSuchElementException e) {
            return new ResponseEntity<Order>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND
            );
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<Order>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST
            );
        }
    }
    
    private void deductInventoryAndSaleQuantity(Order order, String performedBy) {
        try {
            orderService.deductInventoryForOrder(order, performedBy != null ? performedBy : "system");
        } catch (Exception e) {
            e.printStackTrace();
        }
        if (order.getItems() != null) {
            for (Item item : order.getItems()) {
                if (item.getProductId() != null && item.getQuantity() > 0) {
                    try {
                        Map<String, Object> req = new java.util.HashMap<>();
                        req.put("productId", item.getProductId());
                        req.put("variantId", item.getVariantId());
                        req.put("quantity", item.getQuantity());
                        saleClient.consumeSaleQty(req);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    private void applyVoucherIfAny(Order order, String voucherCode, Long userId) {
        if (voucherCode == null || voucherCode.trim().isEmpty()) {
            return;
        }
        try {
            Map<String, Object> req = new java.util.HashMap<>();
            req.put("code", voucherCode.trim());
            req.put("userId", userId);
            req.put("orderAmount", order.getTotal());
            Map<String, Object> res = saleClient.validateVoucher(req);
            if (res != null && Boolean.TRUE.equals(res.get("valid"))) {
                java.math.BigDecimal discountAmount = new java.math.BigDecimal(res.get("discountAmount").toString());
                java.math.BigDecimal newTotal = order.getTotal().subtract(discountAmount);
                if (newTotal.compareTo(java.math.BigDecimal.ZERO) < 0) {
                    newTotal = java.math.BigDecimal.ZERO;
                }
                order.setTotal(newTotal);
                saleClient.consumeVoucher(req);
            } else {
                String errorMsg = res != null && res.get("errorMessage") != null ? res.get("errorMessage").toString() : "Voucher không hợp lệ hoặc đã hết lượt sử dụng.";
                throw new IllegalArgumentException(errorMsg);
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new IllegalArgumentException("Lỗi khi kiểm tra voucher: " + e.getMessage());
        }
    }

    private Order createOrder(List<Item> cart, UserClientResponse user) {
        Order order = new Order();
        order.setItems(prepareItemsForOrder(cart));
        order.setUserId(user.getId());
        order.setUserName(user.getUserName());
        String phoneLast4 = extractPhoneLast4(user, null, null);
        order.setPhoneLast4(phoneLast4);
        order.setMvd(null);
        order.setEstimatedDeliveryDate(null);
        order.setTotal(OrderUtilities.countTotalPrice(cart));
        order.setOrderedDate(LocalDate.now());
        order.setStatus(OrderStatus.CREATED.name());
        order.setOrderNumber(generateReadableOrderNumber(phoneLast4));
        order.setPaymentStatus(PaymentStatus.PENDING.name());
        order.setPaymentMethod(PaymentMethod.COD.name());
        return order;
    }

    private void enrichOrderProductDetails(Order order) {
        if (order == null || order.getItems() == null) {
            return;
        }
        for (Item item : order.getItems()) {
            if (item == null || item.getProductId() == null) {
                continue;
            }
            try {
                item.setProduct(fetchProductWithAdminFallback(item.getProductId()));
            } catch (Exception ignored) {
                // Return order even if product-service is temporarily unavailable.
            }
            fillItemSnapshot(item);
        }
    }

    private String extractPhoneLast4(UserClientResponse user, String shippingAddress, String explicitPhone) {
        String[] candidates = new String[] {
                explicitPhone,
                user != null ? user.getPhoneNumber() : null,
                (user != null && user.getUserDetails() != null) ? user.getUserDetails().getPhoneNumber() : null,
                shippingAddress
        };
        for (String candidate : candidates) {
            String normalized = normalizeToLast4(candidate);
            if (normalized != null) {
                return normalized;
            }
        }
        return null;
    }

    private String normalizeToLast4(String rawPhoneLikeText) {
        if (rawPhoneLikeText == null) {
            return null;
        }
        String digits = rawPhoneLikeText.replaceAll("\\D", "");
        if (digits.length() < 4) {
            return null;
        }
        return digits.substring(digits.length() - 4);
    }

    private String normalizePhoneLast4(String phoneLast4) {
        if (phoneLast4 == null) {
            return null;
        }
        String digits = phoneLast4.replaceAll("\\D", "");
        if (digits.length() != 4) {
            return null;
        }
        return digits;
    }

    private Item buildItem(Long productId, Integer quantity, Long variantId, String variantLabel) {
        Product product = null;
        try {
            product = fetchProductWithAdminFallback(productId);
        } catch (Exception ignored) {
            // Allow checkout flow to continue even when product lookup is temporarily unavailable.
        }
        Item item = new Item();
        item.setProductId(productId);
        item.setProduct(product);
        item.setQuantity(quantity);
        java.math.BigDecimal unitPrice = resolveUnitPrice(productId, variantId, product);
        item.setSubTotal(unitPrice == null
                ? java.math.BigDecimal.ZERO
                : unitPrice.multiply(java.math.BigDecimal.valueOf(quantity.longValue())));
        item.setVariantId(variantId);
        item.setVariantLabel(variantLabel);
        fillItemSnapshot(item);
        return item;
    }

    private java.math.BigDecimal resolveUnitPrice(Long productId, Long variantId, Product product) {
        java.math.BigDecimal originalPrice = null;
        if (variantId != null && variantId > 0) {
            try {
                ProductVariant variant = productClient.getVariantById(variantId);
                if (variant != null
                        && variant.getPrice() != null
                        && variant.getProductId() != null
                        && productId != null
                        && variant.getProductId().equals(productId)) {
                    originalPrice = variant.getPrice();
                }
            } catch (Exception ignored) {
            }
        }
        if (originalPrice == null && product != null) {
            originalPrice = product.getPrice();
        }
        if (originalPrice == null) {
            return null;
        }

        java.math.BigDecimal currentPrice = originalPrice;
        java.math.BigDecimal finalEffectivePrice = currentPrice;

        List<com.rainbowforest.orderservice.dto.SaleProgram> activeSales = null;
        try {
            activeSales = saleClient.getActivePrograms();
        } catch (Exception ignored) { }

        if (activeSales != null) {
            boolean foundSale = false;
            java.math.BigDecimal lowestSalePrice = null;

            for (com.rainbowforest.orderservice.dto.SaleProgram program : activeSales) {
                boolean hasProduct = false;
                if (program.getItems() != null) {
                    for (com.rainbowforest.orderservice.dto.SaleProgramItem pi : program.getItems()) {
                        if (pi.getProductId() != null && pi.getProductId().equals(productId)) {
                            if (pi.getVariantId() == null || (variantId != null && pi.getVariantId().equals(variantId))) {
                                if (pi.getPromoQtyLimit() == null || pi.getPromoQtyLimit() > 0) {
                                    hasProduct = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (hasProduct) {
                    java.math.BigDecimal salePrice = currentPrice;

                    if ("PERCENT".equals(program.getDiscountType())) {
                        java.math.BigDecimal discountVal = currentPrice.multiply(program.getDiscountValue()).divide(new java.math.BigDecimal("100"), java.math.RoundingMode.HALF_UP);
                        salePrice = currentPrice.subtract(discountVal);
                    } else if ("AMOUNT".equals(program.getDiscountType())) {
                        salePrice = program.getDiscountValue();
                    }

                    if (lowestSalePrice == null || salePrice.compareTo(lowestSalePrice) < 0) {
                        lowestSalePrice = salePrice;
                        foundSale = true;
                    }
                }
            }
            if (foundSale) {
                finalEffectivePrice = lowestSalePrice;
            }
        }

        return finalEffectivePrice;
    }

    private List<Item> collectSelectedItems(List<Item> cartItems, List<CodCheckoutRequest.SelectedCartItem> selectedRefs) {
        Set<String> selectedKeys = new HashSet<>();
        for (CodCheckoutRequest.SelectedCartItem selected : selectedRefs) {
            if (selected == null || selected.getProductId() == null) {
                continue;
            }
            selectedKeys.add(selected.getProductId() + ":" + (selected.getVariantId() == null ? "" : selected.getVariantId()));
        }
        List<Item> selectedItems = new ArrayList<>();
        for (Item item : cartItems) {
            if (item == null || item.getProductId() == null) {
                continue;
            }
            String key = item.getProductId() + ":" + (item.getVariantId() == null ? "" : item.getVariantId());
            if (selectedKeys.contains(key)) {
                selectedItems.add(item);
            }
        }
        return selectedItems;
    }

    private List<Item> buildSelectedItemsFromRequest(List<CodCheckoutRequest.SelectedCartItem> selectedRefs) {
        List<Item> selectedItems = new ArrayList<>();
        if (selectedRefs == null) {
            return selectedItems;
        }
        for (CodCheckoutRequest.SelectedCartItem selected : selectedRefs) {
            if (selected == null || selected.getProductId() == null) {
                continue;
            }
            Integer quantity = selected.getQuantity() == null ? 1 : selected.getQuantity();
            if (quantity <= 0) {
                quantity = 1;
            }
            selectedItems.add(buildItem(
                    selected.getProductId(),
                    quantity,
                    selected.getVariantId(),
                    selected.getVariantLabel()
            ));
            // Keep server-side variant pricing when variantId is set; client payload may still carry base product totals.
            Long vid = selected.getVariantId();
            boolean hasVariant = vid != null && vid > 0;
            if (!hasVariant
                    && selected.getSubTotal() != null
                    && selected.getSubTotal().compareTo(java.math.BigDecimal.ZERO) > 0) {
                selectedItems.get(selectedItems.size() - 1).setSubTotal(selected.getSubTotal());
            }
        }
        return selectedItems;
    }

    private Order buildCodOrder(List<Item> items, UserClientResponse user, String shippingAddress, String phoneNumber) {
        Order order = this.createOrder(items, user);
        if (shippingAddress != null && !shippingAddress.trim().isEmpty()) {
            order.setShippingAddress(shippingAddress.trim());
        }
        String phoneLast4 = extractPhoneLast4(user, shippingAddress, phoneNumber);
        if (phoneLast4 != null) {
            order.setPhoneLast4(phoneLast4);
            order.setOrderNumber(generateReadableOrderNumber(phoneLast4));
        }
        order.setPaymentMethod(PaymentMethod.COD.name());
        // COD is collected upon delivery, so order starts as unpaid.
        order.setPaymentStatus(PaymentStatus.PENDING.name());
        order.setStatus(OrderStatus.CREATED.name());
        return order;
    }

    private List<Item> prepareItemsForOrder(List<Item> items) {
        List<Item> out = new ArrayList<>();
        if (items == null) {
            return out;
        }
        for (Item item : items) {
            if (item == null) {
                continue;
            }
            fillItemSnapshot(item);
            if (item.getVariantLabel() != null && item.getVariantLabel().trim().isEmpty()) {
                item.setVariantLabel(null);
            }
            out.add(item);
        }
        return out;
    }

    private void fillItemSnapshot(Item item) {
        if (item == null) {
            return;
        }
        Product product = item.getProduct();
        if (product != null) {
            if (item.getProductNameSnapshot() == null || item.getProductNameSnapshot().trim().isEmpty()) {
                item.setProductNameSnapshot(product.getProductName());
            }
            if (item.getProductSkuSnapshot() == null || item.getProductSkuSnapshot().trim().isEmpty()) {
                item.setProductSkuSnapshot(product.getSku());
            }
        }
        ProductVariant variantForImage = null;
        Long variantId = item.getVariantId();
        Long productId = item.getProductId();
        if (variantId != null && variantId > 0 && productId != null) {
            try {
                ProductVariant v = productClient.getVariantById(variantId);
                if (v != null
                        && v.getProductId() != null
                        && v.getProductId().equals(productId)) {
                    variantForImage = v;
                }
            } catch (Exception ignored) {
                // Fall back to product primary image below.
            }
        }
        String variantImage = variantForImage != null && variantForImage.getVariantImageUrl() != null
                ? variantForImage.getVariantImageUrl().trim()
                : "";
        if (!variantImage.isEmpty()) {
            item.setProductImageSnapshot(variantImage);
        } else if (product != null
                && (item.getProductImageSnapshot() == null || item.getProductImageSnapshot().trim().isEmpty())) {
            item.setProductImageSnapshot(product.getPrimaryImageUrl());
        }
    }

    private List<CodCheckoutRequest.SelectedCartItem> normalizeSelectedForCartRemoval(List<CodCheckoutRequest.SelectedCartItem> selectedCartItems) {
        List<CodCheckoutRequest.SelectedCartItem> out = new ArrayList<>();
        if (selectedCartItems == null) {
            return out;
        }
        for (CodCheckoutRequest.SelectedCartItem row : selectedCartItems) {
            if (row == null || row.getProductId() == null) {
                continue;
            }
            CodCheckoutRequest.SelectedCartItem normalized = new CodCheckoutRequest.SelectedCartItem();
            normalized.setProductId(row.getProductId());
            Long variantId = row.getVariantId();
            normalized.setVariantId((variantId != null && variantId > 0) ? variantId : null);
            normalized.setQuantity(row.getQuantity());
            normalized.setVariantLabel(row.getVariantLabel());
            normalized.setSubTotal(row.getSubTotal());
            out.add(normalized);
        }
        return out;
    }

    private Product fetchProductWithAdminFallback(Long productId) {
        if (productId == null) {
            return null;
        }
        try {
            Product product = productClient.getProductById(productId);
            if (product != null) {
                return product;
            }
        } catch (Exception ignored) {
            // fall through to admin fallback
        }
        try {
            return productClient.getProductForAdminById(productId);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String generateReadableOrderNumber(String phoneLast4) {
        String last4 = phoneLast4 != null ? phoneLast4 : "0000";
        String stamp = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyMMddHHmm"));
        String shortToken = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 6)
                .toUpperCase(Locale.ROOT);
        return "DH" + stamp + "-" + last4 + "-" + shortToken;
    }

    private void trySendOrderEmail(UserClientResponse user, Order saved) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                if (user == null || saved == null) return;
                String email = user.getEmail() != null ? user.getEmail().trim() : "";
                if (email.isEmpty()) return;

                String orderRef = saved.getOrderNumber() != null ? saved.getOrderNumber() : ("#" + saved.getId());
                String subject = "Xác nhận đơn hàng " + orderRef;

                StringBuilder html = new StringBuilder();
                html.append("<p>Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.</p>");
                appendOrderEmailOrderSummary(html, saved);

                SendNotificationRequest req = new SendNotificationRequest();
                req.setChannel("EMAIL");
                req.setRecipient(email);
                req.setSubject(subject);
                req.setBody(html.toString());
                req.setHtml(true);
                notificationClient.send(req);
            } catch (Exception ignored) {
                // Never fail order creation due to email failure.
            }
        });
    }

    /**
     * Đơn SePay/QR: gửi email khi vừa tạo đơn (chờ quét QR), cùng kênh Gmail qua notification-service.
     */
    private void trySendSepayQrOrderEmail(UserClientResponse user, Order saved) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                if (user == null || saved == null) return;
                String email = user.getEmail() != null ? user.getEmail().trim() : "";
                if (email.isEmpty()) return;

                String orderRef = saved.getOrderNumber() != null ? saved.getOrderNumber() : ("#" + saved.getId());
                String subject = "Đơn hàng " + orderRef + " — thanh toán QR (SePay)";

                StringBuilder html = new StringBuilder();
                html.append("<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p>");
                appendOrderEmailOrderSummary(html, saved);
                html.append("<p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>");

                SendNotificationRequest req = new SendNotificationRequest();
                req.setChannel("EMAIL");
                req.setRecipient(email);
                req.setSubject(subject);
                req.setBody(html.toString());
                req.setHtml(true);
                notificationClient.send(req);
            } catch (Exception ignored) {
                // Never fail order creation due to email failure.
            }
        });
    }

    private void appendOrderEmailOrderSummary(StringBuilder html, Order saved) {
        if (saved == null || html == null) {
            return;
        }
        String orderRef = saved.getOrderNumber() != null ? saved.getOrderNumber() : ("#" + saved.getId());
        html.append("<h3>Thông tin đơn hàng</h3>");
        html.append("<ul>");
        html.append("<li><b>Mã đơn:</b> ").append(orderRef).append("</li>");
        html.append("<li><b>Thanh toán:</b> ").append(saved.getPaymentMethod() != null ? saved.getPaymentMethod() : "—").append("</li>");
        html.append("<li><b>Trạng thái:</b> ").append(saved.getStatus() != null ? saved.getStatus() : "—").append("</li>");
        if (saved.getShippingAddress() != null && !saved.getShippingAddress().trim().isEmpty()) {
            html.append("<li><b>Địa chỉ:</b> ").append(saved.getShippingAddress()).append("</li>");
        }
        html.append("<li><b>Tổng tiền:</b> ").append(saved.getTotal() != null ? saved.getTotal().toString() : "—").append(" ₫</li>");
        html.append("</ul>");
        
        html.append("<h3>Chi tiết sản phẩm</h3>");
        html.append("<ul>");
        if (saved.getItems() != null && !saved.getItems().isEmpty()) {
            for (Item it : saved.getItems()) {
                if (it == null) continue;
                String name = (it.getProduct() != null ? it.getProduct().getProductName() : null);
                if (name == null || name.trim().isEmpty()) name = "Sản phẩm";
                html.append("<li>").append(name);
                if (it.getVariantLabel() != null && !it.getVariantLabel().trim().isEmpty()) {
                    html.append(" (Phân loại: ").append(it.getVariantLabel().trim()).append(")");
                }
                html.append(" - Số lượng: ").append(it.getQuantity());
                if (it.getSubTotal() != null) {
                    html.append(" - Thành tiền: ").append(it.getSubTotal().toString()).append(" ₫");
                }
                html.append("</li>");
            }
        }
        html.append("</ul>");
    }

    private void trySendOrderConfirmedNotification(Order order, String performedBy) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                if (order == null || order.getUserId() == null) {
                    return;
                }
                UserClientResponse user = userClient.getUserById(order.getUserId());
                if (user == null) {
                    return;
                }
                String email = user.getEmail() != null ? user.getEmail().trim() : "";
                if (email.isEmpty()) {
                    return;
                }
                String orderRef = order.getOrderNumber() != null ? order.getOrderNumber() : ("#" + order.getId());
                String actor = performedBy != null && !performedBy.trim().isEmpty() ? performedBy.trim() : "Admin";
                String subject = "Đơn hàng " + orderRef + " đã được xác nhận";
                StringBuilder html = new StringBuilder();
                html.append("<p>Xin chào <strong>").append(user.getUserName() != null ? user.getUserName() : "bạn").append("</strong>,</p>");
                html.append("<p>Đơn hàng <b>").append(orderRef).append("</b> của bạn đã được <b>").append(actor).append("</b> xác nhận và đang trong quá trình chuẩn bị giao hàng.</p>");
                
                html.append("<h3>Thông tin cập nhật</h3>");
                html.append("<ul>");
                html.append("<li><b>Trạng thái:</b> ").append(order.getStatus() != null ? order.getStatus() : "CONFIRMED").append("</li>");
                html.append("<li><b>Tổng tiền:</b> ").append(order.getTotal() != null ? order.getTotal().toString() : "—").append(" ₫</li>");
                if (order.getEstimatedDeliveryDate() != null) {
                    html.append("<li><b>Dự kiến giao:</b> ").append(order.getEstimatedDeliveryDate()).append("</li>");
                } else {
                    html.append("<li><b>Dự kiến giao:</b> Chưa xác định</li>");
                }
                html.append("</ul>");
                
                html.append("<p>Bạn có thể truy cập lịch sử đơn hàng trên website để theo dõi trạng thái vận chuyển chi tiết.</p>");

                SendNotificationRequest req = new SendNotificationRequest();
                req.setChannel("EMAIL");
                req.setRecipient(email);
                req.setSubject(subject);
                req.setBody(html.toString());
                req.setHtml(true);
                notificationClient.send(req);
            } catch (Exception ignored) {
                // Never fail admin status update due to notification failure.
            }
        });
    }

    private OrderCheckoutCodResponse toCodCheckoutResponse(Order order) {
        OrderCheckoutCodResponse out = new OrderCheckoutCodResponse();
        if (order == null) {
            return out;
        }
        out.setId(order.getId());
        out.setOrderNumber(order.getOrderNumber());
        out.setStatus(order.getStatus());
        out.setPaymentStatus(order.getPaymentStatus());
        out.setPaymentMethod(order.getPaymentMethod());
        out.setShippingAddress(order.getShippingAddress());
        out.setTotal(order.getTotal());
        out.setItemCount(order.getItems() != null ? order.getItems().size() : 0);
        return out;
    }

    private void createCodPayment(Order order) {
        PaymentClient.CreatePaymentRequest createPayment = new PaymentClient.CreatePaymentRequest();
        createPayment.orderId = order.getId();
        createPayment.amount = order.getTotal();
        createPayment.currency = "VND";
        createPayment.method = PaymentMethod.COD.name();
        paymentClient.create(createPayment);
    }

    private void tryNotifyTelegram(Order order, String explicitPhone) {
        if (order == null) return;
        try {
            java.util.Map<String, Object> details = new java.util.LinkedHashMap<>();
            details.put("orderId", order.getId());
            details.put("orderNumber", order.getOrderNumber());
            details.put("total", order.getTotal() != null ? order.getTotal().toPlainString() : null);
            details.put("paymentMethod", order.getPaymentMethod());
            details.put("itemCount", order.getItems() != null ? order.getItems().size() : 0);
            details.put("userName", order.getUserName());
            details.put("shippingAddress", order.getShippingAddress());
            details.put("phoneLast4", explicitPhone != null ? explicitPhone : order.getPhoneLast4());

            if (order.getItems() != null && !order.getItems().isEmpty()) {
                StringBuilder itemsStr = new StringBuilder();
                for (Item item : order.getItems()) {
                    itemsStr.append("- ").append(item.getProductNameSnapshot() != null ? item.getProductNameSnapshot() : "Sản phẩm")
                            .append(" (x").append(item.getQuantity()).append(")");
                    if (item.getVariantLabel() != null && !item.getVariantLabel().trim().isEmpty()) {
                        itemsStr.append(" [").append(item.getVariantLabel()).append("]");
                    }
                    itemsStr.append("\n");
                }
                details.put("itemsDetail", itemsStr.toString());
            }
            
            new Thread(() -> {
                try {
                    telegramClient.notifyNewOrder(details);
                } catch (Exception e) {
                    System.err.println("Failed to notify telegram: " + e.getMessage());
                }
            }).start();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @GetMapping(value = "/orders/export")
    public ResponseEntity<byte[]> exportOrders(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "paymentStatus", required = false) String paymentStatus,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) {
        try {
            byte[] pdfData = orderService.exportOrdersToPdf(status, paymentStatus, q, startDate, endDate);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Orders_Export.pdf");
            headers.add("Content-Type", "application/pdf");
            return new ResponseEntity<byte[]>(pdfData, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<byte[]>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value = "/orders/{id}/invoice")
    public ResponseEntity<byte[]> exportOrderInvoice(@PathVariable("id") Long id) {
        try {
            Optional<Order> orderOpt = orderService.getOrderById(id);
            if (!orderOpt.isPresent()) {
                return new ResponseEntity<byte[]>(HttpStatus.NOT_FOUND);
            }
            byte[] pdfData = com.rainbowforest.orderservice.utilities.PdfOrderGenerator.generateInvoicePdf(orderOpt.get());
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Invoice_" + id + ".pdf");
            headers.add("Content-Type", "application/pdf");
            return new ResponseEntity<byte[]>(pdfData, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<byte[]>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
