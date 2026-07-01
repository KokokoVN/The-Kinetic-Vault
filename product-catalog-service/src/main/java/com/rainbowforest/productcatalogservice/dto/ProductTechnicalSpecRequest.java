package com.rainbowforest.productcatalogservice.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class ProductTechnicalSpecRequest {

    @NotBlank
    @Size(max = 120)
    private String specKey;

    @NotBlank
    @Size(max = 1000)
    private String specValue;

    @Size(max = 64)
    private String unit;

    private Integer sortOrder;

    private String performedBy;

    /** Nhóm thông số kỹ thuật (ví dụ: "CPU", "Màn hình", "Pin"). */
    @Size(max = 120)
    private String specGroup;

    public String getSpecKey() {
        return specKey;
    }

    public void setSpecKey(String specKey) {
        this.specKey = specKey;
    }

    public String getSpecValue() {
        return specValue;
    }

    public void setSpecValue(String specValue) {
        this.specValue = specValue;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public String getSpecGroup() {
        return specGroup;
    }

    public void setSpecGroup(String specGroup) {
        this.specGroup = specGroup;
    }
}

