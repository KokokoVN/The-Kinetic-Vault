package com.rainbowforest.productcatalogservice.config;

import com.rainbowforest.productcatalogservice.entity.*;
import com.rainbowforest.productcatalogservice.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Profile("dev")
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class CatalogDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductTechnicalSpecRepository productTechnicalSpecRepository;

    public CatalogDataInitializer(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            ProductVariantRepository productVariantRepository,
            ProductTechnicalSpecRepository productTechnicalSpecRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.productVariantRepository = productVariantRepository;
        this.productTechnicalSpecRepository = productTechnicalSpecRepository;
    }

    @Override
    public void run(String... args) {
        Category fashion = upsertCategory("Thoi trang", "thoi-trang");
        Category shoes = upsertCategory("Giay dep", "giay-dep");

        Product p1 = upsertProduct("SKU-DEMO-001", "Ao thun cotton basic", "Ao thun de mac hang ngay", fashion, 189000, 120);
        Product p2 = upsertProduct("SKU-DEMO-003", "Sneaker urban x", "Giay sneaker phong cach duong pho", shoes, 599000, 80);
        Product p3 = upsertProduct("SKU-DEMO-010", "Balo laptop urban", "Balo da nang cho cong viec", fashion, 499000, 45);

        seedProductAssets(p1, "ao-thun-cotton");
        seedProductAssets(p2, "sneaker-urban");
        seedProductAssets(p3, "balo-laptop");
    }

    private Category upsertCategory(String name, String slug) {
        return categoryRepository.findBySlugAndDeletedAtIsNull(slug).orElseGet(() -> {
            Category c = new Category();
            c.setName(name);
            c.setSlug(slug);
            return categoryRepository.save(c);
        });
    }

    private Product upsertProduct(
            String sku,
            String productName,
            String description,
            Category category,
            int price,
            int availability
    ) {
        return productRepository.findBySku(sku).orElseGet(() -> {
            Product p = new Product();
            p.setSku(sku);
            p.setProductName(productName);
            p.setDiscription(description);
            p.setCategoryEntity(category);
            p.setPrice(BigDecimal.valueOf(price));
            p.setAvailability(availability);
            return productRepository.save(p);
        });
    }

    private void seedProductAssets(Product product, String slugBase) {
        Long productId = product.getId();
        if (productImageRepository.findByProduct_IdOrderBySortOrderAsc(productId).isEmpty()) {
            ProductImage img = new ProductImage();
            img.setProduct(product);
            img.setImageUrl("https://picsum.photos/seed/" + slugBase + "/1200/900");
            img.setStoragePath("/seed/" + slugBase + ".jpg");
            img.setSortOrder(0);
            img.setPrimaryImage(true);
            productImageRepository.save(img);
        }

        if (productVariantRepository.findByProduct_IdOrderByIdAsc(productId).isEmpty()) {
            ProductVariant v = new ProductVariant();
            v.setProduct(product);
            v.setSize("M");
            v.setColor("Black");
            v.setPrice(product.getPrice());
            v.setAvailability(Math.max(0, product.getAvailability() - 10));
            v.setVariantImageUrl("https://picsum.photos/seed/" + slugBase + "-variant/800/800");
            productVariantRepository.save(v);
        }

        if (productTechnicalSpecRepository.findByProduct_IdOrderBySortOrderAscIdAsc(productId).isEmpty()) {
            ProductTechnicalSpec s1 = new ProductTechnicalSpec();
            s1.setProduct(product);
            s1.setSpecKey("chat_lieu");
            s1.setSpecValue("Cotton");
            s1.setUnit("");
            s1.setSortOrder(1);
            productTechnicalSpecRepository.save(s1);

            ProductTechnicalSpec s2 = new ProductTechnicalSpec();
            s2.setProduct(product);
            s2.setSpecKey("xuat_xu");
            s2.setSpecValue("Viet Nam");
            s2.setUnit("");
            s2.setSortOrder(2);
            productTechnicalSpecRepository.save(s2);
        }
    }
}
