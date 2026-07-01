package com.rainbowforest.aichatbotservice.controller;

import com.rainbowforest.aichatbotservice.dto.chat.ChatRequest;
import com.rainbowforest.aichatbotservice.dto.chat.ChatResponse;
import com.rainbowforest.aichatbotservice.service.ChatConsultantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestHeader;

import javax.validation.Valid;

@RestController
@RequestMapping("/chat")
@CrossOrigin
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatConsultantService chatConsultantService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request, @RequestHeader(value = "Cookie", required = false) String cookieHeader) {
        return ResponseEntity.ok(chatConsultantService.consult(request, cookieHeader));
    }
}
