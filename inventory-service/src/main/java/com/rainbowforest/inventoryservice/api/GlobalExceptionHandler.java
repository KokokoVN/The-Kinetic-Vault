package com.rainbowforest.inventoryservice.api;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, Object> details = new LinkedHashMap<>();
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            if (!fieldErrors.containsKey(fe.getField())) {
                fieldErrors.put(fe.getField(), fe.getDefaultMessage());
            }
        }
        details.put("fieldErrors", fieldErrors);
        ApiError body = ApiError.of("VALIDATION", "Dữ liệu không hợp lệ", 400, safePath(req), details);
        return new ResponseEntity<>(body, new HttpHeaders(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleBadRequest(IllegalArgumentException ex, HttpServletRequest req) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "Bad request";
        if ("not found".equalsIgnoreCase(msg)) {
            ApiError body = ApiError.of("NOT_FOUND", "Không tìm thấy dữ liệu", 404, safePath(req), null);
            return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
        }
        ApiError body = ApiError.of("BAD_REQUEST", msg, 400, safePath(req), null);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleIllegalState(IllegalStateException ex, HttpServletRequest req) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "Conflict";
        ApiError body = ApiError.of("CONFLICT", msg, 409, safePath(req), null);
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest req) {
        ex.printStackTrace();
        ApiError body = ApiError.of("INTERNAL_ERROR", "Có lỗi hệ thống", 500, safePath(req), null);
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private static String safePath(HttpServletRequest req) {
        try {
            return req != null ? req.getRequestURI() : null;
        } catch (Exception e) {
            return null;
        }
    }
}

