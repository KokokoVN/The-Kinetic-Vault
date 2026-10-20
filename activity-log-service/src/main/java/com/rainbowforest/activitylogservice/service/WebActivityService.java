package com.rainbowforest.activitylogservice.service;

import com.rainbowforest.activitylogservice.dto.WebActivityRequest;
import com.rainbowforest.activitylogservice.entity.WebActivity;

import java.util.List;
import java.util.Optional;

public interface WebActivityService {

    WebActivity log(WebActivityRequest request);

    Optional<WebActivity> findById(Long id);

    List<WebActivity> recent(int limit);

    int deleteByIds(List<Long> ids);

    org.springframework.data.domain.Page<WebActivity> search(String action, String resourceType, String actorUserId, String q, int page, int size);

    java.util.Map<String, Object> stats();

    int purgeOlderThanDays(int days);

    List<WebActivity> findByUser(String userId, int limit);

    String exportCsv(int limit);
}
