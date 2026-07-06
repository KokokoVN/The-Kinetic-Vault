package com.rainbowforest.cartservice.service;

import com.rainbowforest.cartservice.domain.Item;
import com.rainbowforest.cartservice.domain.Product;
import com.rainbowforest.cartservice.domain.ProductVariantInfo;
import com.rainbowforest.cartservice.feignclient.ProductClient;
import com.rainbowforest.cartservice.feignclient.SaleClient;
import com.rainbowforest.cartservice.redis.CartRedisRepository;
import com.rainbowforest.cartservice.utilities.CartUtilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class CartServiceImpl implements CartService {
    private List<Item> toItemList(Collection<Object> raw) {
        List<Item> out = new ArrayList<>();
        if (raw == null) {
            return out;
        }
        for (Object obj : raw) {
            if (obj instanceof Item) {
                out.add((Item) obj);
            }
        }
        return out;
    }

    @Autowired
    private ProductClient productClient;

    @Autowired
    private SaleClient saleClient;

    @Autowired
    private CartRedisRepository cartRedisRepository;

    private List<com.rainbowforest.cartservice.domain.SaleProgram> getActiveSales() {
        try {
            return saleClient.getActivePrograms();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private void applySaleToItem(Item item, BigDecimal originalVariantPrice) {
        if (item.getProduct() == null) return;
        List<com.rainbowforest.cartservice.domain.SaleProgram> activeSales = getActiveSales();
        BigDecimal basePrice = item.getProduct().getPrice();
        BigDecimal currentPrice = originalVariantPrice != null ? originalVariantPrice : basePrice;

        BigDecimal lowestSalePrice = null;
        boolean foundSale = false;

        for (com.rainbowforest.cartservice.domain.SaleProgram program : activeSales) {
            boolean hasProduct = false;
            if (program.getItems() != null) {
                for (com.rainbowforest.cartservice.domain.SaleProgramItem pi : program.getItems()) {
                    if (pi.getProductId() != null && pi.getProductId().equals(item.getProductId())) {
                        Long itemVariantId = item.getVariantId();
                        if (pi.getVariantId() == null || (itemVariantId != null && pi.getVariantId().equals(itemVariantId))) {
                            if (pi.getPromoQtyLimit() == null || pi.getPromoQtyLimit() > 0) {
                                hasProduct = true;
                                break;
                            }
                        }
                    }
                }
            }
            if (hasProduct) {
                BigDecimal salePrice = currentPrice;

                if ("PERCENT".equals(program.getDiscountType())) {
                    BigDecimal discountVal = currentPrice.multiply(program.getDiscountValue()).divide(new BigDecimal("100"), java.math.RoundingMode.HALF_UP);
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

        BigDecimal unitPriceOverrideToUse = originalVariantPrice;
        if (foundSale) {
            item.getProduct().setEffectivePrice(lowestSalePrice);
            if (originalVariantPrice != null) {
                unitPriceOverrideToUse = lowestSalePrice;
            } else {
                unitPriceOverrideToUse = null; 
            }
        } else {
            item.getProduct().setEffectivePrice(null);
        }
        item.setOriginalPrice(currentPrice);
        item.setSubTotal(CartUtilities.getSubTotalForItem(item.getProduct(), unitPriceOverrideToUse, item.getQuantity()));
    }

    @Override
    public void addItemToCart(String cartId, Long productId, Integer quantity) {
        addItemToCart(cartId, productId, quantity, null, null);
    }

    @Override
    public void addItemToCart(String cartId, Long productId, Integer quantity, Long variantId, String variantLabel) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("INVALID_QUANTITY");
        }
        Product product = productClient.getProductById(productId);
        BigDecimal unitPriceOverride = null;
        Item item = new Item(quantity, productId, product, BigDecimal.ZERO);
        if (variantId != null) {
            ProductVariantInfo variant = productClient.getVariantById(variantId);
            if (variant == null || variant.getProductId() == null || !variant.getProductId().equals(productId)) {
                throw new IllegalArgumentException("VARIANT_NOT_FOUND");
            }
            Integer availability = variant.getAvailability() != null ? variant.getAvailability() : 0;
            if (quantity > availability) {
                throw new IllegalArgumentException("INSUFFICIENT_VARIANT_STOCK");
            }
            unitPriceOverride = variant.getPrice();
            item.setVariantId(variantId);
            String vImg = variant.getVariantImageUrl();
            item.setVariantImageUrl(vImg != null && !vImg.trim().isEmpty() ? vImg.trim() : null);
            String label = (variantLabel != null && !variantLabel.trim().isEmpty())
                    ? variantLabel.trim()
                    : variant.getLabel();
            if (label != null && !label.trim().isEmpty()) {
                item.setVariantLabel(label.trim());
            }
        } else {
            Integer availability = product != null && product.getAvailability() != null ? product.getAvailability() : 0;
            if (quantity > availability) {
                throw new IllegalArgumentException("INSUFFICIENT_STOCK");
            }
            item.setVariantImageUrl(null);
        }
        applySaleToItem(item, unitPriceOverride);
        cartRedisRepository.addItemToCart(cartId, item);
    }

    @Override
    public List<Item> getCart(String cartId) {
        List<Item> raw = toItemList(cartRedisRepository.getCart(cartId, Item.class));
        if (raw.isEmpty()) {
            return raw;
        }
        List<Item> enriched = enrichProductDetails(new ArrayList<>(raw));
        List<Item> merged = mergeLinesByProductAndVariant(enriched);
        if (hasDuplicateLineKeys(raw) || merged.size() < raw.size()) {
            persistCartReplace(cartId, merged);
        }
        return merged;
    }

    @Override
    public void changeItemQuantity(String cartId, Long productId, Integer quantity) {
        changeItemQuantity(cartId, productId, quantity, null);
    }

    @Override
    public void changeItemQuantity(String cartId, Long productId, Integer quantity, Long variantId) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("INVALID_QUANTITY");
        }
        List<Item> cart = getCart(cartId);
        boolean found = false;
        for (Item item : cart) {
            if (!isSameItem(item, productId, variantId)) {
                continue;
            }
            found = true;
            Product latestProduct = productClient.getProductById(productId);
            item.setProduct(latestProduct);
            item.setQuantity(quantity);
            BigDecimal unitPriceOverride = null;
            if (variantId != null) {
                ProductVariantInfo variant = productClient.getVariantById(variantId);
                if (variant == null || variant.getProductId() == null || !variant.getProductId().equals(productId)) {
                    throw new IllegalArgumentException("VARIANT_NOT_FOUND");
                }
                Integer availability = variant.getAvailability() != null ? variant.getAvailability() : 0;
                if (quantity > availability) {
                    throw new IllegalArgumentException("INSUFFICIENT_VARIANT_STOCK");
                }
                unitPriceOverride = variant.getPrice();
                String vImg = variant.getVariantImageUrl();
                item.setVariantImageUrl(vImg != null && !vImg.trim().isEmpty() ? vImg.trim() : null);
                if (item.getVariantLabel() == null || item.getVariantLabel().trim().isEmpty()) {
                    String label = variant.getLabel();
                    if (label != null && !label.trim().isEmpty()) {
                        item.setVariantLabel(label.trim());
                    }
                }
            } else {
                Integer availability = latestProduct != null && latestProduct.getAvailability() != null ? latestProduct.getAvailability() : 0;
                if (quantity > availability) {
                    throw new IllegalArgumentException("INSUFFICIENT_STOCK");
                }
                item.setVariantImageUrl(null);
            }
            applySaleToItem(item, unitPriceOverride);
            break;
        }
        if (found) {
            persistCartReplace(cartId, cart);
        }
    }

    @Override
    public void deleteItemFromCart(String cartId, Long productId) {
        deleteItemFromCart(cartId, productId, null);
    }

    @Override
    public void deleteItemFromCart(String cartId, Long productId, Long variantId) {
        List<Item> cart = getCart(cartId);
        cart.removeIf(item -> isSameItem(item, productId, variantId));
        persistCartReplace(cartId, cart);
    }

    @Override
    public boolean checkIfItemIsExist(String cartId, Long productId) {
        return checkIfItemIsExist(cartId, productId, null);
    }

    @Override
    public boolean checkIfItemIsExist(String cartId, Long productId, Long variantId) {
        List<Item> cart = toItemList(cartRedisRepository.getCart(cartId, Item.class));
        for (Item item : cart) {
            if (isSameItem(item, productId, variantId)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public List<Item> getAllItemsFromCart(String cartId) {
        return getCart(cartId);
    }

    @Override
    public void deleteCart(String cartId) {
        cartRedisRepository.deleteCart(cartId);
    }

    @Override
    public void clearAllCarts() {
        Set<String> allKeys = cartRedisRepository.findCartKeys("cart:*");
        if (allKeys != null && !allKeys.isEmpty()) {
            for (String key : allKeys) {
                cartRedisRepository.deleteCart(key);
            }
        }
    }

    @Override
    public Set<String> listCartIds() {
        return cartRedisRepository.findCartKeys("cart:*");
    }

    private boolean isSameItem(Item item, Long productId, Long variantId) {
        if (item == null || item.getProductId() == null) {
            return false;
        }
        if (!item.getProductId().equals(productId)) {
            return false;
        }
        Long existedVariantId = item.getVariantId();
        if (variantId == null) {
            return existedVariantId == null;
        }
        return variantId.equals(existedVariantId);
    }

    private String mergeKey(Item it) {
        if (it == null || it.getProductId() == null) {
            return "";
        }
        return it.getProductId() + ":" + (it.getVariantId() != null ? it.getVariantId().toString() : "");
    }

    private boolean hasDuplicateLineKeys(List<Item> items) {
        Set<String> seen = new HashSet<>();
        for (Item it : items) {
            if (it == null || it.getProductId() == null) {
                continue;
            }
            String k = mergeKey(it);
            if (!seen.add(k)) {
                return true;
            }
        }
        return false;
    }

    private void persistCartReplace(String cartId, List<Item> items) {
        cartRedisRepository.deleteCart(cartId);
        if (items == null || items.isEmpty()) {
            return;
        }
        for (Item it : items) {
            cartRedisRepository.addItemToCart(cartId, it);
        }
    }

    /**
     * Gộp các dòng cùng productId + variantId (Redis SET có thể lưu hai JSON hơi khác nhau).
     */
    private List<Item> mergeLinesByProductAndVariant(List<Item> items) {
        Map<String, List<Item>> groups = new LinkedHashMap<>();
        for (Item it : items) {
            if (it == null || it.getProductId() == null) {
                continue;
            }
            groups.computeIfAbsent(mergeKey(it), k -> new ArrayList<>()).add(it);
        }
        List<Item> out = new ArrayList<>();
        for (List<Item> group : groups.values()) {
            if (group.size() == 1) {
                out.add(group.get(0));
                continue;
            }
            Item base = group.get(0);
            int totalQty = 0;
            BigDecimal totalSub = BigDecimal.ZERO;
            for (Item x : group) {
                totalQty += x.getQuantity();
                if (x.getSubTotal() != null) {
                    totalSub = totalSub.add(x.getSubTotal());
                }
            }
            Item merged = new Item();
            merged.setProductId(base.getProductId());
            merged.setVariantId(base.getVariantId());
            merged.setVariantLabel(firstNonBlankVariantLabel(group));
            merged.setVariantImageUrl(firstNonBlankVariantImage(group));
            merged.setProduct(base.getProduct());
            merged.setOriginalPrice(base.getOriginalPrice());
            merged.setQuantity(totalQty);
            merged.setSubTotal(totalSub);
            out.add(merged);
        }
        return out;
    }

    private String firstNonBlankVariantLabel(List<Item> group) {
        for (Item x : group) {
            if (x.getVariantLabel() != null && !x.getVariantLabel().trim().isEmpty()) {
                return x.getVariantLabel().trim();
            }
        }
        return null;
    }

    private String firstNonBlankVariantImage(List<Item> group) {
        for (Item x : group) {
            if (x.getVariantImageUrl() != null && !x.getVariantImageUrl().trim().isEmpty()) {
                return x.getVariantImageUrl().trim();
            }
        }
        return null;
    }

    private List<Item> enrichProductDetails(List<Item> items) {
        for (Item item : items) {
            if (item == null || item.getProductId() == null) {
                continue;
            }
            BigDecimal unitPriceOverride = null;
            try {
                item.setProduct(productClient.getProductById(item.getProductId()));
            } catch (Exception ignored) {
                // Avoid stale product snapshot from Redis when product is hidden/deleted/not found.
                item.setProduct(null);
            }
            Long vid = item.getVariantId();
            if (vid != null && vid > 0) {
                try {
                    ProductVariantInfo v = productClient.getVariantById(vid);
                    if (v != null
                            && v.getProductId() != null
                            && v.getProductId().equals(item.getProductId())) {
                        String vImg = v.getVariantImageUrl();
                        item.setVariantImageUrl(vImg != null && !vImg.trim().isEmpty() ? vImg.trim() : null);
                        unitPriceOverride = v.getPrice();
                    }
                } catch (Exception ignored) {
                    // Keep cached variantImageUrl from Redis if catalog is down.
                }
            } else {
                item.setVariantImageUrl(null);
            }
            
            if (item.getProduct() != null) {
                applySaleToItem(item, unitPriceOverride);
            }
        }
        return items;
    }
}
