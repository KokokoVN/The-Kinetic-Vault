package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.Product;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterAdminProducts(String q, Long categoryId, Long brandId, String filterDeleted) {
        return (root, query, cb) -> {
            // Cần fetch categories/images để tránh N+1 nếu có (chỉ làm khi fetch list)
            if (Long.class != query.getResultType()) {
                root.fetch("categoryEntity", JoinType.LEFT);
                root.fetch("images", JoinType.LEFT);
                query.distinct(true);
            }

            List<Predicate> predicates = new ArrayList<>();

            // Status filter
            if ("active".equalsIgnoreCase(filterDeleted)) {
                predicates.add(cb.isNull(root.get("deletedAt")));
                // Có thể cần loại trừ hidden nếu muốn, nhưng Admin vẫn thấy hidden.
                // Yêu cầu cũ là active = không bị xoá mềm.
            } else if ("deleted".equalsIgnoreCase(filterDeleted)) {
                predicates.add(cb.isNotNull(root.get("deletedAt")));
            }
            // "all" thì không filter theo deletedAt

            // Lọc theo search term
            if (q != null && !q.trim().isEmpty()) {
                String searchStr = "%" + q.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("productName")), searchStr);
                Predicate skuMatch = cb.like(cb.lower(root.get("sku")), searchStr);
                // Tìm kiếm theo ID nếu user gõ số
                try {
                    Long id = Long.parseLong(q.trim());
                    Predicate idMatch = cb.equal(root.get("id"), id);
                    predicates.add(cb.or(nameMatch, skuMatch, idMatch));
                } catch (NumberFormatException e) {
                    predicates.add(cb.or(nameMatch, skuMatch));
                }
            }

            // Lọc theo categoryId
            if (categoryId != null) {
                // Tương thích với cột categoryEntity
                predicates.add(cb.equal(root.get("categoryEntity").get("id"), categoryId));
            }

            // Lọc theo brandId
            if (brandId != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), brandId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
