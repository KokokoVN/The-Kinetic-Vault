package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Brand;
import java.util.List;

public interface BrandService {
    List<Brand> getAllBrands();
    Brand getBrandById(Long id);
    Brand addBrand(Brand brand, String actorUsername, String actorUserId);
    Brand updateBrand(Long id, Brand patch, String actorUsername, String actorUserId);
    void deleteBrand(Long id, String actorUsername, String actorUserId);
}
