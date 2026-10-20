package com.rainbowforest.cartservice.scheduler;

import com.rainbowforest.cartservice.redis.CartRedisRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class CartRecoveryScheduler {

    private static final Logger logger = LoggerFactory.getLogger(CartRecoveryScheduler.class);
    private final CartRedisRepository cartRedisRepository;

    public CartRecoveryScheduler(CartRedisRepository cartRedisRepository) {
        this.cartRedisRepository = cartRedisRepository;
    }

    /**
     * Định kỳ quét giỏ hàng hàng ngày lúc 09:00 AM (Cron: 0 0 9 * * ?)
     * Nhắc nhở người dùng có giỏ hàng chưa thanh toán (Abandoned Cart Recovery)
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void checkAbandonedCarts() {
        logger.info("[AbandonedCart] Starting Abandoned Cart Recovery check...");
        try {
            Set<String> cartKeys = cartRedisRepository.findCartKeys("cart:*");
            if (cartKeys == null || cartKeys.isEmpty()) {
                logger.info("[AbandonedCart] No active carts found. Skipping.");
                return;
            }
            int count = 0;
            for (String key : cartKeys) {
                try {
                    java.util.Collection<Object> items = cartRedisRepository.getCart(key, Object.class);
                    if (items != null && !items.isEmpty()) {
                        count++;
                        // Trích xuất userId từ key "cart:<userId>"
                        String userId = key.startsWith("cart:") ? key.substring(5) : key;
                        logger.info("[AbandonedCart] User {} has abandoned cart with {} item(s). Consider sending a recovery notification.", userId, items.size());
                        // TODO: Gọi notification-service để gửi Email/Telegram nhắc nhở + Voucher ưu đãi
                    }
                } catch (Exception cartEx) {
                    logger.warn("[AbandonedCart] Could not read cart key={}: {}", key, cartEx.getMessage());
                }
            }
            logger.info("[AbandonedCart] Recovery check completed. Total abandoned carts found: {}", count);
        } catch (Exception e) {
            logger.error("[AbandonedCart] Error during Abandoned Cart Recovery execution", e);
        }
    }
}
