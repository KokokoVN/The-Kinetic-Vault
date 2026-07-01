package com.rainbowforest.productcatalogservice.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class ProductExcelRowDto {
    private int rowId;
    private String sku;
    private String productName;
    private String description;
    private BigDecimal price;
    private Long brandId;
    private String brandName;
    private Long categoryId;
    private String categoryName;
    private String size;
    private String color;
    private BigDecimal variantPrice;

    private boolean valid = true;
    private List<String> errorMessages = new ArrayList<>();
    
    private List<SpecExcelDto> specs = new ArrayList<>();

    public void addError(String message) {
        this.valid = false;
        this.errorMessages.add(message);
    }

    @Data
    public static class SpecExcelDto {
        private String group;
        private String key;
        private String value;
        private String unit;
    }
}
