package com.rainbowforest.aichatbotservice.dto.sale;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SaleProgramItemDto {
    private Long id;
    private Long productId;
    private Long variantId;
    private String productName;
}
