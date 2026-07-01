package com.rainbowforest.cartservice.redis;

import java.util.Collection;
import java.util.Set;

public interface CartRedisRepository {

    void addItemToCart(String key, Object item);

    Collection<Object> getCart(String key, Class<?> type);

    void deleteItemFromCart(String key, Object item);

    void deleteCart(String key);

    Set<String> findCartKeys(String pattern);
}
