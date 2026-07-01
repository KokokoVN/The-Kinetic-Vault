package com.rainbowforest.aichatbotservice.dto.catalog;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductSearchResponse {
    private List<CatalogProductDto> items = new ArrayList<>();
    private Integer page;
    private Integer size;
    private Integer totalItems;
    private Integer totalPages;
}
