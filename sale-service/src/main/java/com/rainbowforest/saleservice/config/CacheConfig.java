package com.rainbowforest.saleservice.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Bật Spring Cache (in-memory ConcurrentHashMap) cho sale-service.
 *
 * <p>Các cache sử dụng:
 * <ul>
 *   <li>{@code activeSalePrograms} - danh sách chương trình khuyến mãi đang chạy (TTL hiệu lực 5-10 phút thông qua evict khi CRUD).</li>
 *   <li>{@code activeBanners} - danh sách banner đang hiển thị trên storefront.</li>
 * </ul>
 *
 * <p>Lưu ý: nếu deploy nhiều instance, nên chuyển sang Redis cache để đồng bộ giữa các pod.
 * Hiện tại dùng in-memory cho đơn giản và không cần thêm dependency.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("activeSalePrograms", "activeBanners");
    }
}
