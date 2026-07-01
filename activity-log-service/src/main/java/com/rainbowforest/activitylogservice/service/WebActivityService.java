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
}
