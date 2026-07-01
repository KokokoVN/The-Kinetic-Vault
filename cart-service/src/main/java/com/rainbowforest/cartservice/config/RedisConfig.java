package com.rainbowforest.cartservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

@Configuration
public class RedisConfig {

    @Bean
    JedisConnectionFactory jedisConnectionFactory() {
        return new JedisConnectionFactory();
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(jedisConnectionFactory());
        return template;
    }

    @Bean(destroyMethod = "close")
    public JedisPool jedisPool() {
        // Defaults: localhost:6379. Keep config minimal for dev stability.
        JedisPoolConfig cfg = new JedisPoolConfig();
        cfg.setMaxTotal(32);
        cfg.setMaxIdle(16);
        cfg.setMinIdle(2);
        cfg.setTestOnBorrow(true);
        cfg.setTestWhileIdle(true);
        return new JedisPool(cfg, "localhost", 6379, 2000);
    }
}
