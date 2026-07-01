package com.rainbowforest.aichatbotservice.dto.sale;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SaleProgramDto {
    private Long id;
    private String name;
    private String description;
    /** "PERCENT" hoặc "AMOUNT" */
    private String discountType;
    private BigDecimal discountValue;
    private String startAt;
    private String endAt;
    private Boolean active;
    private List<SaleProgramItemDto> items = new ArrayList<>();
}
