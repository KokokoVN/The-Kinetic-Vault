package com.rainbowforest.reviewservice.repository;

import com.rainbowforest.reviewservice.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);
    List<Review> findByUserId(Long userId);
    List<Review> findByUserIdAndProductId(Long userId, Long productId);
    List<Review> findByOrderIdAndVariantId(Long orderId, Long variantId);
    Optional<Review> findByIdAndUserId(Long id, Long userId);
}
