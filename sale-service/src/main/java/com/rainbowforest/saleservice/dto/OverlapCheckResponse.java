package com.rainbowforest.saleservice.dto;

public class OverlapCheckResponse {
    private boolean overlap;
    private String message;

    public OverlapCheckResponse() {}

    public OverlapCheckResponse(boolean overlap, String message) {
        this.overlap = overlap;
        this.message = message;
    }

    public boolean isOverlap() { return overlap; }
    public void setOverlap(boolean overlap) { this.overlap = overlap; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
