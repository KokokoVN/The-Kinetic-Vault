package com.rainbowforest.cartservice.config;

import com.rainbowforest.cartservice.domain.Item;
import com.rainbowforest.cartservice.redis.CartRedisRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@Profile("dev")
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class CartDataInitializer implements CommandLineRunner {

    private final CartRedisRepository cartRedisRepository;

    public CartDataInitializer(CartRedisRepository cartRedisRepository) {
        this.cartRedisRepository = cartRedisRepository;
    }

    @Override
    public void run(String... args) {
        Set<String> keys = cartRedisRepository.findCartKeys("cart:*");
        seedIfMissing(keys, "cart:demo-user-01",
                item(1L, "SKU-DEMO-001", "Ao thun cotton basic", 2, 189000),
                item(2L, "SKU-DEMO-003", "Sneaker urban x", 1, 599000)
        );
        seedIfMissing(keys, "cart:demo-user-02",
                item(3L, "SKU-DEMO-010", "Balo laptop urban", 1, 499000)
        );
        seedIfMissing(keys, "cart:demo-user-03",
                item(1L, "SKU-DEMO-001", "Ao thun cotton basic", 1, 189000),
                item(3L, "SKU-DEMO-010", "Balo laptop urban", 1, 499000)
        );
        seedIfMissing(keys, "cart:guest-01",
                item(2L, "SKU-DEMO-003", "Sneaker urban x", 1, 599000)
        );
    }

    private void seedIfMissing(Set<String> existingKeys, String cartId, Item... items) {
        if (existingKeys != null && existingKeys.contains(cartId)) {
            return;
        }
        for (Item item : items) {
            cartRedisRepository.addItemToCart(cartId, item);
        }
    }

    private Item item(Long productId, String sku, String productName, int quantity, int unitPrice) {
        Item i = new Item();
        i.setProductId(productId);
        i.setQuantity(quantity);
        i.setSubTotal(java.math.BigDecimal.valueOf((long) quantity * unitPrice));
        i.setVariantLabel(productName + " [" + sku + "]");
        return i;
    }
}
