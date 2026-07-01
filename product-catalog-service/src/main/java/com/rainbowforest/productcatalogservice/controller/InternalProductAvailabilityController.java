package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/internal/products")
public class InternalProductAvailabilityController {

    private final ProductRepository productRepository;

    public InternalProductAvailabilityController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PutMapping("/{productId}/availability")
    public ResponseEntity<Void> updateAvailability(@PathVariable("productId") Long productId,
                                                   @RequestParam("availability") Integer availability) {
        if (productId == null) {
            return ResponseEntity.noContent().build();
        }
        long id = productId.longValue();
        productRepository.findById(id).ifPresent(product -> {
            product.setAvailability(availability != null ? availability.intValue() : 0);
            productRepository.save(product);
        });
        return ResponseEntity.noContent().build();
    }
}

