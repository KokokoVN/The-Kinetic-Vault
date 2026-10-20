package com.rainbowforest.productcatalogservice.api;

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
import org.springframework.web.multipart.MaxUploadSizeExceededException;

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
        if ("DUPLICATE_PRODUCT_NAME".equals(msg)) {
            ApiError body = ApiError.of("DUPLICATE_PRODUCT_NAME",
                    "Tên sản phẩm đã tồn tại (không phân biệt hoa thường).",
                    409, safePath(req), null);
            return new ResponseEntity<>(body, HttpStatus.CONFLICT);
        }
        if ("DUPLICATE_NAME".equals(msg)) {
            ApiError body = ApiError.of("DUPLICATE_NAME",
                    "Tên danh mục đã tồn tại (không phân biệt hoa thường).",
                    409, safePath(req), null);
            return new ResponseEntity<>(body, HttpStatus.CONFLICT);
        }
        // Không leak raw message - log server-side, trả generic cho client.
        log.debug("IllegalArgumentException: {}", msg);
        ApiError body = ApiError.of("BAD_REQUEST", "Yêu cầu không hợp lệ", 400, safePath(req), null);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleIllegalState(IllegalStateException ex, HttpServletRequest req) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "Conflict";
        // Whitelist các message an toàn.
        if (!isWhitelistedMessage(msg)) {
            log.debug("IllegalStateException: {}", msg);
            msg = "Trạng thái không hợp lệ";
        }
        ApiError body = ApiError.of("CONFLICT", msg, 409, safePath(req), null);
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleMaxSizeException(MaxUploadSizeExceededException ex, HttpServletRequest req) {
        ApiError body = ApiError.of("FILE_TOO_LARGE", "Dung lượng ảnh vượt quá giới hạn cho phép (tối đa 10MB).", 400, safePath(req), null);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest req) {
        // Log chi tiết server-side; KHÔNG leak raw exception message cho client.
        log.error("Lỗi không mong muốn tại API: ", ex);
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
     * Whitelist các message an toàn được phép trả về client.
     */
    private static boolean isWhitelistedMessage(String msg) {
        if (msg == null) return false;
        return msg.startsWith("Còn danh mục con")
                || msg.startsWith("Không thể xóa")
                || msg.startsWith("Danh mục đã được xóa trước đó")
                || msg.startsWith("Còn sản phẩm liên quan");
    }
}

