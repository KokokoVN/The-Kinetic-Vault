package com.rainbowforest.cartservice.domain;

import java.math.BigDecimal;

public class ProductVariantInfo {
    private Long id;
    private Long productId;
    private String size;
    private String color;
    private String variantImageUrl;
    private BigDecimal price;
    private Integer availability;
    private String variantName;
    private String attributesJson;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getVariantImageUrl() {
        return variantImageUrl;
    }

    public void setVariantImageUrl(String variantImageUrl) {
        this.variantImageUrl = variantImageUrl;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getAvailability() {
        return availability;
    }

    public void setAvailability(Integer availability) {
        this.availability = availability;
    }

    public String getVariantName() {
        return variantName;
    }

    public void setVariantName(String variantName) {
        this.variantName = variantName;
    }

    public String getAttributesJson() {
        return attributesJson;
    }

    public void setAttributesJson(String attributesJson) {
        this.attributesJson = attributesJson;
    }

    public String getLabel() {
        if (attributesJson != null && !attributesJson.trim().isEmpty()) {
            try {
                com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(attributesJson);
                if (root.isArray() && root.size() > 0) {
                    java.util.List<String> parts = new java.util.ArrayList<>();
                    for (com.fasterxml.jackson.databind.JsonNode item : root) {
                        String name = item.has("name") ? item.get("name").asText() : "";
                        String value = item.has("value") ? item.get("value").asText() : "";
                        if (!value.trim().isEmpty()) {
                            parts.add((name.isEmpty() ? "" : name + ": ") + value.trim());
                        }
                    }
                    if (!parts.isEmpty()) {
                        return String.join(" · ", parts);
                    }
                }
            } catch (Exception ignored) {}
        }
        if (variantName != null && !variantName.trim().isEmpty()) {
            return variantName.trim();
        }
        String s = size != null ? size.trim() : "";
        String c = color != null ? color.trim() : "";
        if (!s.isEmpty() && !c.isEmpty()) {
            return s + " / " + c;
        }
        return (!s.isEmpty() ? s : c);
    }
}

