package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class ProductController {
    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private ProductRepository productRepository;

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        // Log chi tiết phía server; trả về client thông báo generic (tránh leak stack trace).
        log.error("Unhandled exception in ProductController", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "INTERNAL_ERROR", "message", "Lỗi hệ thống"));
    }

    @GetMapping(value = "/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProduct();
        if (!products.isEmpty()) {
            return new ResponseEntity<List<Product>>(
                    products,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<List<Product>>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products/available")
    public ResponseEntity<List<Product>> getAvailableProductsForUser() {
        List<Product> products = productService.getAllAvailableProductForUser();
        if (!products.isEmpty()) {
            return new ResponseEntity<List<Product>>(
                    products,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<List<Product>>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products/available/category/{categoryId}")
    public ResponseEntity<List<Product>> getAvailableProductsByCategoryId(@PathVariable("categoryId") Long categoryId) {
        List<Product> products = productService.getAllAvailableProductForUserByCategoryId(categoryId);
        if (!products.isEmpty()) {
            return new ResponseEntity<List<Product>>(
                    products,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<List<Product>>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products/newest")
    public ResponseEntity<List<Product>> getNewestAvailableProducts(
            @RequestParam(value = "limit", required = false, defaultValue = "8") Integer limit) {
        List<Product> products = productService.getNewestAvailableProductsForUser(limit != null ? limit : 8);
        if (!products.isEmpty()) {
            return new ResponseEntity<List<Product>>(
                    products,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<List<Product>>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products/hot")
    public ResponseEntity<List<Product>> getHotAvailableProducts(
            @RequestParam(value = "limit", required = false, defaultValue = "8") Integer limit) {
        List<Product> products = productService.getHotAvailableProductsForUser(limit != null ? limit : 8);
        if (!products.isEmpty()) {
            return new ResponseEntity<List<Product>>(
                    products,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<List<Product>>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products/batch")
    public ResponseEntity<List<Product>> getProductsBatch(
            @RequestParam(value = "ids") List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ResponseEntity<List<Product>>(
                    java.util.Collections.emptyList(),
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        List<Product> products = productService.getProductsByIds(ids);
        return new ResponseEntity<List<Product>>(
                products,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    private static String removeAccents(String s) {
        if (s == null) return "";
        String normalized = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "").toLowerCase(Locale.ROOT).replace("đ", "d");
    }

    @GetMapping(value = "/products/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "status", required = false, defaultValue = "all") String status,
            @RequestParam(value = "page", required = false, defaultValue = "1") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "10") Integer size) {
        List<Product> all = productService.getAllAvailableProductForUser();
        String keyword = q != null ? q.trim().toLowerCase(Locale.ROOT) : "";
        String normKeyword = removeAccents(keyword);
        String st = status != null ? status.trim().toLowerCase(Locale.ROOT) : "all";

        List<Product> filtered = all.stream()
                .filter(p -> {
                    if (p.getDeletedAt() != null || Boolean.TRUE.equals(p.getHidden())) {
                        return false;
                    }
                    if (keyword.isEmpty()) {
                        return true;
                    }
                    String nameNorm = removeAccents(p.getProductName());
                    String skuNorm = removeAccents(p.getSku());
                    String brandNorm = removeAccents(p.getBrandName());
                    String descNorm = removeAccents(p.getDiscription());
                    
                    boolean match = nameNorm.contains(normKeyword) 
                            || skuNorm.contains(normKeyword) 
                            || brandNorm.contains(normKeyword) 
                            || descNorm.contains(normKeyword);

                    if (!match && p.getCategoryNames() != null) {
                        for (String cName : p.getCategoryNames()) {
                            if (removeAccents(cName).contains(normKeyword)) {
                                match = true;
                                break;
                            }
                        }
                    }
                    return match;
                })
                .filter(p -> {
                    int avail = p.getAvailability() != null ? p.getAvailability() : 0;
                    if ("in_stock".equals(st)) {
                        return avail >= 20;
                    }
                    if ("low_stock".equals(st)) {
                        return avail > 0 && avail < 20;
                    }
                    if ("out_stock".equals(st)) {
                        return avail <= 0;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        int safeSize = size != null ? Math.max(5, Math.min(50, size)) : 10;
        int totalItems = filtered.size();
        int totalPages = Math.max(1, (int) Math.ceil((double) totalItems / safeSize));
        int safePage = page != null ? Math.max(1, Math.min(totalPages, page)) : 1;
        int start = (safePage - 1) * safeSize;
        int end = Math.min(start + safeSize, totalItems);
        List<Product> items = start < end ? filtered.subList(start, end) : java.util.Collections.emptyList();

        return new ResponseEntity<>(
                Map.of(
                        "items", items,
                        "page", safePage,
                        "size", safeSize,
                        "totalItems", totalItems,
                        "totalPages", totalPages
                ),
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping(value = "/products", params = "category")
    public ResponseEntity<List<Product>> getAllProductByCategory(@RequestParam("category") String category) {
        List<Product> products = productService.getAllProductByCategory(category);
        if (!products.isEmpty()) {
            return new ResponseEntity<List<Product>>(
                    products,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<List<Product>>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products/{id}")
    public ResponseEntity<Product> getOneProductById(@PathVariable("id") long id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            return new ResponseEntity<Product>(
                    product,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<Product>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products", params = "name")
    public ResponseEntity<List<Product>> getAllProductsByName(@RequestParam("name") String name) {
        List<Product> products = productService.getAllProductsByName(name);
        if (!products.isEmpty()) {
            return new ResponseEntity<List<Product>>(
                    products,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<List<Product>>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    /**
     * POST /products/{id}/view
     * Tăng lượt xem của sản phẩm lên 1.
     * Gọi từ frontend mỗi khi user vào trang chi tiết sản phẩm.
     */
    @PostMapping(value = "/products/{id}/view")
    public ResponseEntity<?> incrementView(@PathVariable("id") Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return new ResponseEntity<>(Map.of("message", "Không tìm thấy sản phẩm"), HttpStatus.NOT_FOUND);
        }
        long newCount = (product.getViewCount() != null ? product.getViewCount() : 0L) + 1L;
        product.setViewCount(newCount);
        productRepository.save(product);
        log.debug("Tăng lượt xem sản phẩm id={}, viewCount={}", id, newCount);
        return ResponseEntity.ok(Map.of("viewCount", newCount));
    }

    /**
     * POST /products/{id}/sales?count=N
     * Tăng lượt bán của sản phẩm (mặc định +1, hoặc +count nếu truyền vào).
     * Gọi sau khi đơn hàng hoàn thành.
     */
    @PostMapping(value = "/products/{id}/sales")
    public ResponseEntity<?> incrementSales(
            @PathVariable("id") Long id,
            @RequestParam(value = "count", required = false, defaultValue = "1") Integer count) {
        if (count == null || count < 1) {
            count = 1;
        }
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return new ResponseEntity<>(Map.of("message", "Không tìm thấy sản phẩm"), HttpStatus.NOT_FOUND);
        }
        long newCount = (product.getSalesCount() != null ? product.getSalesCount() : 0L) + count;
        product.setSalesCount(newCount);
        productRepository.save(product);
        log.debug("Tăng lượt bán sản phẩm id={}, salesCount={}", id, newCount);
        return ResponseEntity.ok(Map.of("salesCount", newCount));
    }
}
