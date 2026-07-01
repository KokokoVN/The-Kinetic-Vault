package com.rainbowforest.cartservice.service;

import com.rainbowforest.cartservice.domain.Item;

import java.util.List;
import java.util.Set;

public interface CartService {

    void addItemToCart(String cartId, Long productId, Integer quantity);

    void addItemToCart(String cartId, Long productId, Integer quantity, Long variantId, String variantLabel);

    List<Item> getCart(String cartId);

    void changeItemQuantity(String cartId, Long productId, Integer quantity);

    void changeItemQuantity(String cartId, Long productId, Integer quantity, Long variantId);

    void deleteItemFromCart(String cartId, Long productId);

    void deleteItemFromCart(String cartId, Long productId, Long variantId);

    boolean checkIfItemIsExist(String cartId, Long productId);

    boolean checkIfItemIsExist(String cartId, Long productId, Long variantId);

    List<Item> getAllItemsFromCart(String cartId);

    void deleteCart(String cartId);

    void clearAllCarts();

    Set<String> listCartIds();
}
