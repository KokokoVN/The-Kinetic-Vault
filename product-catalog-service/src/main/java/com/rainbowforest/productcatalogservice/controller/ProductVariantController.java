package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.dto.ProductVariantPublicDto;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.entity.ProductVariant;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import com.rainbowforest.productcatalogservice.repository.ProductVariantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class ProductVariantController {
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    public ProductVariantController(ProductRepository productRepository, ProductVariantRepository productVariantRepository) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
    }

    @GetMapping("/products/{productId}/variants")
    public ResponseEntity<List<ProductVariantPublicDto>> listVariantsForUser(@PathVariable Long productId) {
        Product p = productRepository.findById(productId).orElse(null);
        if (p == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        List<ProductVariant> variants = productVariantRepository.findByProduct_IdOrderByIdAsc(productId);
        return ResponseEntity.ok(variants.stream().map(this::toPublicDto).collect(Collectors.toList()));
    }

    @GetMapping("/product-variants/{variantId}")
    public ResponseEntity<ProductVariantPublicDto> getVariantById(@PathVariable Long variantId) {
        ProductVariant v = productVariantRepository.findById(variantId).orElse(null);
        if (v == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(toPublicDto(v));
    }

    private ProductVariantPublicDto toPublicDto(ProductVariant v) {
        ProductVariantPublicDto out = new ProductVariantPublicDto();
        out.setId(v.getId());
        out.setProductId(v.getProduct() != null ? v.getProduct().getId() : null);
        out.setSize(v.getSize());
        out.setColor(v.getColor());
        out.setVariantImageUrl(v.getVariantImageUrl());
        out.setPrice(v.getPrice());
        out.setAvailability(v.getAvailability());
        return out;
    }
}

