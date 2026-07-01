package com.rainbowforest.orderservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.OrderStatus;
import java.util.Optional;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    boolean existsByOrderNumber(String orderNumber);
    boolean existsByMvd(String mvd);
    Optional<Order> findByMvdAndPhoneLast4(String mvd, String phoneLast4);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items i WHERE i.productId = :productId AND o.status = :status")
    boolean existsByProductIdAndStatus(@org.springframework.data.repository.query.Param("productId") Long productId, @org.springframework.data.repository.query.Param("status") OrderStatus status);

    @Query("SELECT o.orderedDate, SUM(o.total) FROM Order o WHERE o.orderedDate >= :startDate AND o.status != 'CANCELLED' GROUP BY o.orderedDate ORDER BY o.orderedDate ASC")
    List<Object[]> findRevenueTrendsByDateAfter(@Param("startDate") LocalDate startDate);

    @Query("SELECT o.orderedDate, SUM(o.total) FROM Order o WHERE o.orderedDate >= :startDate AND o.orderedDate <= :endDate AND o.status != 'CANCELLED' GROUP BY o.orderedDate ORDER BY o.orderedDate ASC")
    List<Object[]> findRevenueTrendsBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
