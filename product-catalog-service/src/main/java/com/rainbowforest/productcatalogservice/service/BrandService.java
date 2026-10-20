package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.dto.BrandResponseDto;
import com.rainbowforest.productcatalogservice.entity.Brand;
import com.rainbowforest.productcatalogservice.entity.Product;
import org.springframework.data.domain.Page;

import java.util.List;

public interface BrandService {
    List<Brand> getAllBrands();
    List<BrandResponseDto> getAllBrandDtos(String deletionFilter);
    Brand getBrandById(Long id);
    BrandResponseDto getBrandDtoById(Long id);
    Page<BrandResponseDto> getAdminBrandsPaged(int page, int size, String q, String deleted, String sortBy);
    Brand addBrand(Brand brand, String actorUsername, String actorUserId);
    Brand updateBrand(Long id, Brand patch, String actorUsername, String actorUserId);
    void deleteBrand(Long id, String actorUsername, String actorUserId);
    Brand restoreBrand(Long id, String actorUsername, String actorUserId);
    List<Product> getBrandProducts(Long id);
}

