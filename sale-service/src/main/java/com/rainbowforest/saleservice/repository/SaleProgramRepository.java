package com.rainbowforest.saleservice.repository;

import com.rainbowforest.saleservice.entity.SaleProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleProgramRepository extends JpaRepository<SaleProgram, Long> {

    List<SaleProgram> findByActiveTrue();

    /**
     * Tìm các chương trình đang active và trong khoảng thời gian hiệu lực.
     * Dùng JOIN FETCH items để tránh N+1 query khi serialize cache.
     */
    @Query("SELECT DISTINCT sp FROM SaleProgram sp LEFT JOIN FETCH sp.items WHERE sp.active = true AND sp.startAt <= :now AND sp.endAt >= :now")
    List<SaleProgram> findCurrentlyActive(@Param("now") LocalDateTime now);
}
