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

    List<WebActivity> findAllByActorUserIdOrderByCreatedAtDesc(String actorUserId, Pageable pageable);

    long countByIdIn(List<Long> ids);

    @Modifying
    @Query("delete from WebActivity w where w.id in :ids")
    void deleteByIds(@Param("ids") List<Long> ids);

    @Query("select w from WebActivity w where " +
           "(:action is null or :action = '' or lower(w.action) like lower(concat('%', :action, '%'))) and " +
           "(:resourceType is null or :resourceType = '' or lower(w.resourceType) like lower(concat('%', :resourceType, '%'))) and " +
           "(:actorUserId is null or :actorUserId = '' or w.actorUserId = :actorUserId) and " +
           "(:q is null or :q = '' or lower(w.action) like lower(concat('%', :q, '%')) or lower(w.requestPath) like lower(concat('%', :q, '%')) or lower(w.actorUsername) like lower(concat('%', :q, '%'))) " +
           "order by w.createdAt desc")
    org.springframework.data.domain.Page<WebActivity> search(
            @Param("action") String action,
            @Param("resourceType") String resourceType,
            @Param("actorUserId") String actorUserId,
            @Param("q") String q,
            Pageable pageable);

    @Modifying
    @Query("delete from WebActivity w where w.createdAt < :cutoff")
    int deleteOlderThan(@Param("cutoff") java.time.LocalDateTime cutoff);
}
