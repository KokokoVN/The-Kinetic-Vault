package com.rainbowforest.productcatalogservice.service;

import java.util.List;

import com.rainbowforest.productcatalogservice.entity.Product;

public interface ProductService {
    public List<Product> getAllProduct();
    public List<Product> getAllAvailableProductForUser();
    public List<Product> getAllAvailableProductForUserByCategoryId(Long categoryId);
    public List<Product> getNewestAvailableProductsForUser(int limit);
    public List<Product> getHotAvailableProductsForUser(int limit);
    public List<Product> getAvailableProductsByIds(List<Long> ids);
    public List<Product> getAllProductByCategory(String category);
    public Product getProductById(Long id);

    /** Chi tiết sản phẩm cho admin (bao gồm hidden / soft-deleted). */
    Product getProductForAdminById(Long id);
    public List<Product> getAllProductsByName(String name);
    Product addProduct(Product product, String actorUsername, String actorUserId);

    Product updateProduct(Long id, Product patch, String actorUsername, String actorUserId);

    void deleteProduct(Long productId, String actorUsername, String actorUserId);

    Product restoreProduct(Long productId, String actorUsername, String actorUserId);

    Product setProductHidden(Long productId, boolean hidden, String actorUsername, String actorUserId);

    void incrementViewCount(Long productId);

    void incrementSalesCount(Long productId, Long quantity);
}
