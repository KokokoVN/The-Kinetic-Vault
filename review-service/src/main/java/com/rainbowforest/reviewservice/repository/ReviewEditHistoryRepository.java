package com.rainbowforest.reviewservice.repository;

import com.rainbowforest.reviewservice.entity.ReviewEditHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewEditHistoryRepository extends JpaRepository<ReviewEditHistory, Long> {
    List<ReviewEditHistory> findByReviewIdOrderByEditedAtDesc(Long reviewId);
}
