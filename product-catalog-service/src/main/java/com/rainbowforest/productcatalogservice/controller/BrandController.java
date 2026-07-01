package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Brand;
import com.rainbowforest.productcatalogservice.service.BrandService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/brands")
public class BrandController {

    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = brandService.getAllBrands();
        if (brands.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Brand> getBrandById(@PathVariable Long id) {
        Brand brand = brandService.getBrandById(id);
        if (brand == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(brand);
    }
}
