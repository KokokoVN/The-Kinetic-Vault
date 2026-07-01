package com.rainbowforest.activitylogservice.dto;

import java.util.List;

public class DeleteWebActivitiesRequest {
    private List<Long> ids;

    public List<Long> getIds() {
        return ids;
    }

    public void setIds(List<Long> ids) {
        this.ids = ids;
    }
}
