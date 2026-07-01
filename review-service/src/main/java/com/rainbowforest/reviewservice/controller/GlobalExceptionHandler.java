package com.rainbowforest.reviewservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.servlet.http.HttpServletRequest;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, HttpServletRequest request) {
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", ZonedDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSZ")));
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", HttpStatus.BAD_REQUEST.getReasonPhrase());
        body.put("message", ex.getMessage());
        body.put("path", request.getRequestURI());

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}
