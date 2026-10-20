package com.rainbowforest.inventoryservice.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

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
        // Không leak raw message - chỉ trả generic message cho client.
        // Log chi tiết phía server để debug.
        log.debug("IllegalArgumentException: {}", msg);
        ApiError body = ApiError.of("BAD_REQUEST", "Yêu cầu không hợp lệ", 400, safePath(req), null);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleIllegalState(IllegalStateException ex, HttpServletRequest req) {
        // Chỉ trả message đã biết trước, tránh leak thông tin nội bộ.
        String msg = ex.getMessage() != null ? ex.getMessage() : "Conflict";
        // Whitelist các message an toàn được phép trả về.
        if (!isWhitelistedMessage(msg)) {
            log.debug("IllegalStateException: {}", msg);
            msg = "Trạng thái không hợp lệ";
        }
        ApiError body = ApiError.of("CONFLICT", msg, 409, safePath(req), null);
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest req) {
        log.error("Lỗi hệ thống không mong muốn trong inventory-service: ", ex);
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

    /**
     * Whitelist các exception message được phép trả về cho client.
     * Các message không nằm trong whitelist sẽ bị thay bằng generic message.
     */
    private static boolean isWhitelistedMessage(String msg) {
        if (msg == null) return false;
        return msg.startsWith("Không đủ tồn kho")
                || msg.startsWith("Không thể xuất kho")
                || msg.startsWith("Số lượng không hợp lệ")
                || msg.startsWith("Product not found")
                || msg.startsWith("Variant not found")
                || msg.startsWith("Không tìm thấy");
    }
}

