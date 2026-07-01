package com.rainbowforest.reviewservice.repository;

import com.rainbowforest.reviewservice.entity.ReviewResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewResponseRepository extends JpaRepository<ReviewResponse, Long> {
}
