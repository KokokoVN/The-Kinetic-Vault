package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Brand;
import com.rainbowforest.productcatalogservice.repository.BrandRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;

    public BrandServiceImpl(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    @Override
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    @Override
    public Brand getBrandById(Long id) {
        return brandRepository.findById(id).orElse(null);
    }

    @Override
    public Brand addBrand(Brand brand, String actorUsername, String actorUserId) {
        if (brand == null || brand.getName() == null || brand.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Brand name is required");
        }
        String nameTrim = brand.getName().trim();
        if (brandRepository.existsByNameIgnoreCase(nameTrim)) {
            throw new IllegalArgumentException("DUPLICATE_BRAND_NAME");
        }
        brand.setName(nameTrim);
        brand.setCreatedBy(actorUsername);
        brand.setCreatedByUserId(actorUserId);
        brand.setUpdatedBy(actorUsername);
        brand.setUpdatedByUserId(actorUserId);
        return brandRepository.save(brand);
    }

    @Override
    public Brand updateBrand(Long id, Brand patch, String actorUsername, String actorUserId) {
        Brand existing = brandRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));
        if (patch.getName() == null || patch.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Brand name is required");
        }
        String nameTrim = patch.getName().trim();
        if (brandRepository.existsByNameIgnoreCaseAndIdNot(nameTrim, id)) {
            throw new IllegalArgumentException("DUPLICATE_BRAND_NAME");
        }
        existing.setName(nameTrim);
        if (patch.getDescription() != null) {
            existing.setDescription(patch.getDescription().trim());
        }
        if (patch.getLogoUrl() != null) {
            existing.setLogoUrl(patch.getLogoUrl().trim());
        }
        existing.setUpdatedBy(actorUsername);
        existing.setUpdatedByUserId(actorUserId);
        return brandRepository.save(existing);
    }

    @Override
    public void deleteBrand(Long id, String actorUsername, String actorUserId) {
        Brand existing = brandRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));
        brandRepository.delete(existing);
    }
}
