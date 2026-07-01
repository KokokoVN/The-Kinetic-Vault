package com.rainbowforest.cartservice.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.exceptions.JedisConnectionException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Set;

@Repository
public class CartRedisRepositoryImpl implements CartRedisRepository {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private JedisPool jedisPool;

    private interface JedisWork<T> {
        T run(Jedis j) throws Exception;
    }

    private <T> T withJedis(JedisWork<T> work) {
        // Jedis instances are NOT thread-safe. Always borrow from pool per operation.
        try (Jedis j = jedisPool.getResource()) {
            return work.run(j);
        } catch (JedisConnectionException first) {
            // Retry once with a fresh connection.
            try (Jedis j = jedisPool.getResource()) {
                return work.run(j);
            } catch (Exception second) {
                throw second instanceof RuntimeException ? (RuntimeException) second : new RuntimeException(second);
            }
        } catch (Exception e) {
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    @Override
    public void addItemToCart(String key, Object item) {
        withJedis(j -> {
            try {
                String jsonObject = objectMapper.writeValueAsString(item);
                j.sadd(key, jsonObject);
                return null;
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Override
    public Collection<Object> getCart(String key, Class<?> type) {
        Collection<Object> cart = new ArrayList<>();
        Set<String> members = withJedis(j -> j.smembers(key));
        for (String smember : members) {
            try {
                cart.add(objectMapper.readValue(smember, type));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        return cart;
    }

    @Override
    public void deleteItemFromCart(String key, Object item) {
        withJedis(j -> {
            try {
                String itemCart = objectMapper.writeValueAsString(item);
                j.srem(key, itemCart);
                return null;
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Override
    public void deleteCart(String key) {
        withJedis(j -> {
            j.del(key);
            return null;
        });
    }

    @Override
    public Set<String> findCartKeys(String pattern) {
        return withJedis(j -> j.keys(pattern));
    }
}
