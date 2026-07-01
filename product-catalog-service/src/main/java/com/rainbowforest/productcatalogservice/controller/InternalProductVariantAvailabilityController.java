package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.repository.ProductVariantRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/product-variants")
public class InternalProductVariantAvailabilityController {

    private final ProductVariantRepository productVariantRepository;

    public InternalProductVariantAvailabilityController(ProductVariantRepository productVariantRepository) {
        this.productVariantRepository = productVariantRepository;
    }

    @PutMapping("/{variantId}/availability")
    public ResponseEntity<Void> updateAvailability(@PathVariable("variantId") Long variantId,
                                                   @RequestParam("availability") Integer availability) {
        long id = variantId == null ? 0L : variantId.longValue();
        if (id < 1) {
            return ResponseEntity.noContent().build();
        }
        int newAvailability = availability != null ? availability.intValue() : 0;
        productVariantRepository.findById(id).ifPresent(variant -> {
            variant.setAvailability(Math.max(0, newAvailability));
            productVariantRepository.save(variant);
        });
        return ResponseEntity.noContent().build();
    }
}
