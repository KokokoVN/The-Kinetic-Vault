package com.rainbowforest.activitylogservice.repository;

import com.rainbowforest.activitylogservice.entity.WebActivity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WebActivityRepository extends JpaRepository<WebActivity, Long> {

    List<WebActivity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByIdIn(List<Long> ids);

    @Modifying
    @Query("delete from WebActivity w where w.id in :ids")
    void deleteByIds(@Param("ids") List<Long> ids);
}
