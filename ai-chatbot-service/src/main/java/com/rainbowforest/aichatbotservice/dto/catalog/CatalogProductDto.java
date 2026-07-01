package com.rainbowforest.aichatbotservice.dto.catalog;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.math.BigDecimal;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CatalogProductDto {
    private Long id;
    private String sku;
    private String productName;
    private BigDecimal price;
    private String discription;
    private Long categoryId;
    private String category;
    private Integer availability;
    private BigDecimal effectivePrice;
    private BigDecimal minVariantPrice;
    private BigDecimal maxVariantPrice;
}
