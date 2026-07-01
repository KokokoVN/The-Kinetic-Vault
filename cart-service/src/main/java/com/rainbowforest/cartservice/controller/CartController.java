package com.rainbowforest.cartservice.controller;

import com.rainbowforest.activitylog.ActivityLogPublisher;
import com.rainbowforest.cartservice.domain.Item;
import com.rainbowforest.cartservice.dto.CartResponse;
import com.rainbowforest.cartservice.dto.RemoveCartItemsRequest;
import com.rainbowforest.cartservice.http.header.HeaderGenerator;
import com.rainbowforest.cartservice.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@RestController
public class CartController {

    @Autowired
    CartService cartService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private ActivityLogPublisher activityLogPublisher;

    private String resolveCartKey(String cookieHeader) {
        if (cookieHeader == null || cookieHeader.trim().isEmpty()) {
            return "cart:" + UUID.randomUUID();
        }
        String[] parts = cookieHeader.split(";");
        for (String p : parts) {
            String v = p.trim();
            if (v.startsWith("cartId=") && v.length() > "cartId=".length()) {
                return v.substring("cartId=".length());
            }
        }
        return cookieHeader.trim();
    }

    @GetMapping(value = {"/", "/cart", "/shop/cart"})
    public ResponseEntity<List<Item>> getCart(@RequestHeader(value = "Cookie") String cartId) {
        String cartKey = resolveCartKey(cartId);
        List<Item> cart = cartService.getCart(cartKey);
        if (!cart.isEmpty()) {
            return new ResponseEntity<List<Item>>(
                    cart,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<List<Item>>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = {"/items", "/cart/items", "/shop/cart/items"})
    public ResponseEntity<CartResponse> getCartItems(@RequestHeader(value = "Cookie", required = false) String cartId) {
        String cartKey = resolveCartKey(cartId);
        CartResponse out = toCartResponse(cartKey, cartService.getCart(cartKey));
        return new ResponseEntity<CartResponse>(
                out,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @GetMapping(value = "/carts/admin")
    public ResponseEntity<List<CartResponse>> listAllCartsForAdmin() {
        List<CartResponse> out = new ArrayList<>();
        for (String cartId : cartService.listCartIds()) {
            List<Item> items = cartService.getCart(cartId);
            if (items == null || items.isEmpty()) {
                continue;
            }
            out.add(toCartResponse(cartId, items));
        }
        out.sort(Comparator.comparing(CartResponse::getCartId));
        return new ResponseEntity<List<CartResponse>>(
                out,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @GetMapping(value = "/carts/admin/{cartId}")
    public ResponseEntity<CartResponse> getCartForAdmin(@PathVariable("cartId") String cartId) {
        String key = cartId == null ? "" : cartId.trim();
        if (key.isEmpty()) {
            return new ResponseEntity<CartResponse>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST
            );
        }
        List<Item> items = cartService.getCart(key);
        if (items == null || items.isEmpty()) {
            return new ResponseEntity<CartResponse>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND
            );
        }
        return new ResponseEntity<CartResponse>(
                toCartResponse(key, items),
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @DeleteMapping(value = "/carts/admin/clear-all")
    public ResponseEntity<Void> clearAllCarts() {
        cartService.clearAllCarts();
        
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("resourceType", "Cart");
        detail.put("note", "All carts cleared by Admin");
        
        activityLogPublisher.publish(
                "cart-service",
                "CART_CLEAR_ALL",
                "Cart",
                "ALL",
                "DELETE",
                "/carts/admin/clear-all",
                detail,
                null,
                null);
                
        return new ResponseEntity<Void>(
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @PostMapping(value = {"/", "/cart", "/shop/cart"}, params = {"productId", "quantity"})
    public ResponseEntity<List<Item>> addItemToCart(
            @RequestParam("productId") Long productId,
            @RequestParam("quantity") Integer quantity,
            @RequestParam(value = "variantId", required = false) Long variantId,
            @RequestParam(value = "variantLabel", required = false) String variantLabel,
            @RequestHeader(value = "Cookie") String cartId,
            HttpServletRequest request) {
        if (quantity == null || quantity <= 0) {
            return new ResponseEntity<List<Item>>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST);
        }
        String cartKey = resolveCartKey(cartId);
        List<Item> cart = cartService.getCart(cartKey);
        if (cart != null) {
            try {
                int existingQty = 0;
                for (Item it : cart) {
                    if (it != null && productId.equals(it.getProductId())
                            && (variantId == null ? it.getVariantId() == null : variantId.equals(it.getVariantId()))) {
                        existingQty = it.getQuantity();
                        break;
                    }
                }
                if (existingQty > 0) {
                    cartService.changeItemQuantity(cartKey, productId, existingQty + quantity, variantId);
                } else {
                    cartService.addItemToCart(cartKey, productId, quantity, variantId, variantLabel);
                }
            } catch (IllegalArgumentException ex) {
                String code = ex.getMessage() != null ? ex.getMessage().trim() : "";
                if ("VARIANT_NOT_FOUND".equals(code)) {
                    return new ResponseEntity<List<Item>>(
                            headerGenerator.getHeadersForError(),
                            HttpStatus.NOT_FOUND);
                }
                if ("INSUFFICIENT_STOCK".equals(code)) {
                    return new ResponseEntity<List<Item>>(
                            headerGenerator.getHeadersForError(),
                            HttpStatus.CONFLICT);
                }
                if ("INSUFFICIENT_VARIANT_STOCK".equals(code)) {
                    return new ResponseEntity<List<Item>>(
                            headerGenerator.getHeadersForError(),
                            HttpStatus.CONFLICT);
                }
                return new ResponseEntity<List<Item>>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.BAD_REQUEST);
            }
            Map<String, Object> after = new LinkedHashMap<>();
            after.put("productId", productId);
            after.put("quantity", quantity);
            after.put("variantId", variantId);
            after.put("variantLabel", variantLabel);
            if (cartKey.length() > 6) {
                after.put("cartKeySuffix", cartKey.substring(cartKey.length() - 6));
            }
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("resourceType", "Cart");
            detail.put("after", after);
            activityLogPublisher.publish(
                    "cart-service",
                    "CART_ITEM_UPSERT",
                    "Cart",
                    cartKey,
                    "POST",
                    "/cart",
                    detail,
                    null,
                    null);
            List<Item> latest = cartService.getCart(cartKey);
            return new ResponseEntity<List<Item>>(
                    latest,
                    headerGenerator.getHeadersForSuccessPostMethod(request, Math.abs((long) cartKey.hashCode())),
                    HttpStatus.CREATED);
        }
        return new ResponseEntity<List<Item>>(
                headerGenerator.getHeadersForError(),
                HttpStatus.BAD_REQUEST);
    }

    @PutMapping(value = {"/", "/cart", "/shop/cart"}, params = {"productId", "quantity"})
    public ResponseEntity<List<Item>> updateItemQuantity(
            @RequestParam("productId") Long productId,
            @RequestParam("quantity") Integer quantity,
            @RequestParam(value = "variantId", required = false) Long variantId,
            @RequestHeader(value = "Cookie") String cartId
    ) {
        String cartKey = resolveCartKey(cartId);
        if (quantity == null || quantity <= 0) {
            return new ResponseEntity<List<Item>>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST
            );
        }
        if (!cartService.checkIfItemIsExist(cartKey, productId, variantId)) {
            return new ResponseEntity<List<Item>>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND
            );
        }
        try {
            cartService.changeItemQuantity(cartKey, productId, quantity, variantId);
        } catch (IllegalArgumentException ex) {
            String code = ex.getMessage() != null ? ex.getMessage().trim() : "";
            if ("VARIANT_NOT_FOUND".equals(code)) {
                return new ResponseEntity<List<Item>>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.NOT_FOUND
                );
            }
            if ("INSUFFICIENT_STOCK".equals(code)) {
                return new ResponseEntity<List<Item>>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.CONFLICT
                );
            }
            if ("INSUFFICIENT_VARIANT_STOCK".equals(code)) {
                return new ResponseEntity<List<Item>>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.CONFLICT
                );
            }
            return new ResponseEntity<List<Item>>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST
            );
        }
        Map<String, Object> after = new LinkedHashMap<>();
        after.put("productId", productId);
        after.put("quantity", quantity);
        after.put("variantId", variantId);
        if (cartKey.length() > 6) {
            after.put("cartKeySuffix", cartKey.substring(cartKey.length() - 6));
        }
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("resourceType", "Cart");
        detail.put("after", after);
        activityLogPublisher.publish(
                "cart-service",
                "CART_ITEM_UPDATE",
                "Cart",
                cartKey,
                "PUT",
                "/cart",
                detail,
                null,
                null);
        return new ResponseEntity<List<Item>>(
                cartService.getCart(cartKey),
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @DeleteMapping(value = {"/", "/cart", "/shop/cart"}, params = "productId")
    public ResponseEntity<Void> removeItemFromCart(
            @RequestParam("productId") Long productId,
            @RequestParam(value = "variantId", required = false) Long variantId,
            @RequestHeader(value = "Cookie") String cartId) {
        String cartKey = resolveCartKey(cartId);
        List<Item> cart = cartService.getCart(cartKey);
        if (cart != null) {
            cartService.deleteItemFromCart(cartKey, productId, variantId);
            Map<String, Object> after = new LinkedHashMap<>();
            after.put("productId", productId);
            after.put("variantId", variantId);
            if (cartKey.length() > 6) {
                after.put("cartKeySuffix", cartKey.substring(cartKey.length() - 6));
            }
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("resourceType", "Cart");
            detail.put("after", after);
            activityLogPublisher.publish(
                    "cart-service",
                    "CART_ITEM_REMOVE",
                    "Cart",
                    cartKey,
                    "DELETE",
                    "/cart",
                    detail,
                    null,
                    null);
            return new ResponseEntity<Void>(
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<Void>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @DeleteMapping(value = {"/clear", "/cart/clear", "/shop/cart/clear"})
    public ResponseEntity<Void> clearCart(@RequestHeader(value = "Cookie") String cartId) {
        String cartKey = resolveCartKey(cartId);
        cartService.deleteCart(cartKey);
        Map<String, Object> before = new LinkedHashMap<>();
        if (cartKey.length() > 6) {
            before.put("cartKeySuffix", cartKey.substring(cartKey.length() - 6));
        }
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("resourceType", "Cart");
        detail.put("before", before);
        activityLogPublisher.publish(
                "cart-service",
                "CART_CLEAR",
                "Cart",
                cartKey,
                "DELETE",
                "/cart/clear",
                detail,
                null,
                null);
        return new ResponseEntity<Void>(
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @DeleteMapping(value = {"/selected", "/cart/selected", "/shop/cart/selected"})
    public ResponseEntity<List<Item>> removeSelectedItems(
            @RequestHeader(value = "Cookie") String cartId,
            @RequestBody(required = false) RemoveCartItemsRequest request
    ) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            return new ResponseEntity<List<Item>>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST
            );
        }
        String cartKey = resolveCartKey(cartId);
        List<Item> cart = cartService.getCart(cartKey);
        if (cart == null || cart.isEmpty()) {
            return new ResponseEntity<List<Item>>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND
            );
        }

        Set<String> keys = new HashSet<>();
        for (RemoveCartItemsRequest.SelectedItem selected : request.getItems()) {
            if (selected == null || selected.getProductId() == null) {
                continue;
            }
            Long selectedProductId = selected.getProductId();
            Long selectedVariantId = selected.getVariantId();
            if (selectedVariantId == null) {
                List<Item> latest = cartService.getCart(cartKey);
                for (Item row : latest) {
                    if (row == null || row.getProductId() == null) {
                        continue;
                    }
                    if (!selectedProductId.equals(row.getProductId())) {
                        continue;
                    }
                    keys.add(selectedProductId + ":" + (row.getVariantId() == null ? "" : row.getVariantId()));
                    cartService.deleteItemFromCart(cartKey, selectedProductId, row.getVariantId());
                }
            } else {
                keys.add(selectedProductId + ":" + selectedVariantId);
                cartService.deleteItemFromCart(cartKey, selectedProductId, selectedVariantId);
            }
        }

        Map<String, Object> after = new LinkedHashMap<>();
        after.put("removedCount", keys.size());
        if (cartKey.length() > 6) {
            after.put("cartKeySuffix", cartKey.substring(cartKey.length() - 6));
        }
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("resourceType", "Cart");
        detail.put("after", after);
        activityLogPublisher.publish(
                "cart-service",
                "CART_SELECTED_REMOVE",
                "Cart",
                cartKey,
                "DELETE",
                "/cart/selected",
                detail,
                null,
                null);
        return new ResponseEntity<List<Item>>(
                cartService.getCart(cartKey),
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    // Safer alternative for clients that cannot send body with DELETE (e.g. some Feign setups).
    @PostMapping(value = {"/selected/remove", "/cart/selected/remove", "/shop/cart/selected/remove"})
    public ResponseEntity<List<Item>> removeSelectedItemsViaPost(
            @RequestHeader(value = "Cookie") String cartId,
            @RequestBody(required = false) RemoveCartItemsRequest request
    ) {
        return removeSelectedItems(cartId, request);
    }

    private CartResponse toCartResponse(String cartKey, List<Item> items) {
        CartResponse out = new CartResponse();
        out.setCartId(cartKey);
        out.setItems(items);
        out.setItemCount(items.size());
        BigDecimal total = BigDecimal.ZERO;
        for (Item item : items) {
            if (item.getSubTotal() != null) {
                total = total.add(item.getSubTotal());
            }
        }
        out.setTotal(total);
        return out;
    }
}
