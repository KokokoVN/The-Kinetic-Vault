package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.dto.BrandResponseDto;
import com.rainbowforest.productcatalogservice.entity.Brand;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.BrandRepository;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.criteria.Predicate;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Transactional
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    public BrandServiceImpl(BrandRepository brandRepository, ProductRepository productRepository) {
        this.brandRepository = brandRepository;
        this.productRepository = productRepository;
    }

    private static String slugify(String input) {
        if (input == null) return "brand";
        String s = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace("đ", "d")
                .replace("Đ", "D");
        s = s.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return s.isEmpty() ? "brand" : s;
    }

    private String uniqueSlug(String base, Long currentId) {
        String slug = base;
        int n = 0;
        while (currentId == null 
                ? brandRepository.existsBySlugIgnoreCase(slug) 
                : brandRepository.existsBySlugIgnoreCaseAndIdNot(slug, currentId)) {
            n++;
            slug = base + "-" + n;
            if (n > 1000) {
                slug = base + "-" + System.currentTimeMillis();
                break;
            }
        }
        return slug;
    }

    private BrandResponseDto toDto(Brand brand) {
        if (brand == null) return null;
        BrandResponseDto dto = new BrandResponseDto();
        dto.setId(brand.getId());
        dto.setName(brand.getName());
        dto.setSlug(brand.getSlug());
        dto.setDescription(brand.getDescription());
        dto.setLogoUrl(brand.getLogoUrl());
        dto.setWebsite(brand.getWebsite());
        dto.setCountry(brand.getCountry());
        dto.setHidden(brand.getHidden());
        dto.setCreatedAt(brand.getCreatedAt());
        dto.setUpdatedAt(brand.getUpdatedAt());
        dto.setDeletedAt(brand.getDeletedAt());
        dto.setCreatedBy(brand.getCreatedBy());
        dto.setUpdatedBy(brand.getUpdatedBy());

        // Count active products belonging to this brand
        if (brand.getId() != null) {
            dto.setProductCount(productRepository.countLinkedToBrand(brand.getId()));
        } else {
            dto.setProductCount(0L);
        }
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Brand> getAllBrands() {
        return brandRepository.findByDeletedAtIsNullOrderByNameAsc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponseDto> getAllBrandDtos(String deletionFilter) {
        List<Brand> list;
        if ("deleted".equalsIgnoreCase(deletionFilter)) {
            list = brandRepository.findByDeletedAtIsNotNullOrderByNameAsc();
        } else if ("all".equalsIgnoreCase(deletionFilter)) {
            list = brandRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
        } else {
            list = brandRepository.findByDeletedAtIsNullOrderByNameAsc();
        }
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Brand getBrandById(Long id) {
        return brandRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public BrandResponseDto getBrandDtoById(Long id) {
        Brand brand = brandRepository.findById(id).orElse(null);
        return toDto(brand);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BrandResponseDto> getAdminBrandsPaged(int page, int size, String q, String deleted, String sortBy) {
        Sort sort;
        if ("name_asc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "name");
        } else if ("name_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "name");
        } else if ("oldest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "id");
        } else {
            sort = Sort.by(Sort.Direction.DESC, "id");
        }

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);

        Specification<Brand> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Deletion filter
            if ("deleted".equalsIgnoreCase(deleted)) {
                predicates.add(cb.isNotNull(root.get("deletedAt")));
            } else if (!"all".equalsIgnoreCase(deleted)) {
                predicates.add(cb.isNull(root.get("deletedAt")));
            }

            // Keyword search
            if (q != null && !q.trim().isEmpty()) {
                String pattern = "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), pattern);
                Predicate slugLike = cb.like(cb.lower(root.get("slug")), pattern);
                Predicate countryLike = cb.like(cb.lower(root.get("country")), pattern);
                Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(nameLike, slugLike, countryLike, descLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Brand> brandPage = brandRepository.findAll(spec, pageable);
        List<BrandResponseDto> dtos = brandPage.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, brandPage.getTotalElements());
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

        // Auto generate slug if missing
        if (brand.getSlug() == null || brand.getSlug().trim().isEmpty()) {
            brand.setSlug(uniqueSlug(slugify(nameTrim), null));
        } else {
            String slugClean = slugify(brand.getSlug().trim());
            brand.setSlug(uniqueSlug(slugClean, null));
        }

        if (brand.getDescription() != null) {
            brand.setDescription(brand.getDescription().trim());
        }
        if (brand.getWebsite() != null) {
            brand.setWebsite(brand.getWebsite().trim());
        }
        if (brand.getCountry() != null) {
            brand.setCountry(brand.getCountry().trim());
        }
        if (brand.getLogoUrl() != null) {
            brand.setLogoUrl(brand.getLogoUrl().trim());
        }
        if (brand.getHidden() == null) {
            brand.setHidden(Boolean.FALSE);
        }

        brand.setCreatedBy(actorUsername);
        brand.setCreatedByUserId(actorUserId);
        brand.setUpdatedBy(actorUsername);
        brand.setUpdatedByUserId(actorUserId);
        brand.setDeletedAt(null);
        brand.setDeletedBy(null);
        brand.setDeletedByUserId(null);

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

        // Update or generate slug
        if (patch.getSlug() != null && !patch.getSlug().trim().isEmpty()) {
            existing.setSlug(uniqueSlug(slugify(patch.getSlug().trim()), id));
        } else if (existing.getSlug() == null || existing.getSlug().trim().isEmpty()) {
            existing.setSlug(uniqueSlug(slugify(nameTrim), id));
        }

        if (patch.getDescription() != null) {
            existing.setDescription(patch.getDescription().trim());
        }
        if (patch.getLogoUrl() != null) {
            existing.setLogoUrl(patch.getLogoUrl().trim());
        }
        if (patch.getWebsite() != null) {
            existing.setWebsite(patch.getWebsite().trim());
        }
        if (patch.getCountry() != null) {
            existing.setCountry(patch.getCountry().trim());
        }
        if (patch.getHidden() != null) {
            existing.setHidden(patch.getHidden());
        }

        existing.setUpdatedBy(actorUsername);
        existing.setUpdatedByUserId(actorUserId);
        return brandRepository.save(existing);
    }

    @Override
    public void deleteBrand(Long id, String actorUsername, String actorUserId) {
        Brand existing = brandRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        // Soft Delete: Mark deletedAt, deletedBy
        existing.setDeletedAt(LocalDateTime.now());
        existing.setDeletedBy(actorUsername != null ? actorUsername : "admin");
        existing.setDeletedByUserId(actorUserId);
        brandRepository.save(existing);
    }

    @Override
    public Brand restoreBrand(Long id, String actorUsername, String actorUserId) {
        Brand existing = brandRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        // Restore: Clear deletedAt
        existing.setDeletedAt(null);
        existing.setDeletedBy(null);
        existing.setDeletedByUserId(null);
        existing.setUpdatedBy(actorUsername != null ? actorUsername : "admin");
        existing.setUpdatedByUserId(actorUserId);
        return brandRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> getBrandProducts(Long id) {
        return productRepository.findAllLinkedToBrand(id);
    }
}
