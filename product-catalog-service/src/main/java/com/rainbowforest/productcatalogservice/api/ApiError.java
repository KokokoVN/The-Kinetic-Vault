package com.rainbowforest.productcatalogservice.api;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {

    /** Mã lỗi ngắn để frontend switch-case (VD: VALIDATION, NOT_FOUND, DUPLICATE_PRODUCT_NAME). */
    private String error;
    /** Thông báo hiển thị cho người dùng (tiếng Việt). */
    private String message;
    private Integer status;
    private String path;
    private String timestamp;
    /** Chi tiết thêm (fieldErrors, counts, debug...) */
    private Map<String, Object> details;

    public static ApiError of(String error, String message, int status, String path, Map<String, Object> details) {
        ApiError e = new ApiError();
        e.setError(error);
        e.setMessage(message);
        e.setStatus(status);
        e.setPath(path);
        e.setTimestamp(Instant.now().toString());
        e.setDetails(details);
        return e;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }
}

