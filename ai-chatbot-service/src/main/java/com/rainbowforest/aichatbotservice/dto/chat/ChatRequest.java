package com.rainbowforest.aichatbotservice.dto.chat;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

@Data
public class ChatRequest {

    @NotBlank(message = "message không được để trống")
    private String message;

    /** Lịch sử ngắn: role = user | assistant */
    private List<ChatMessageDto> history = new ArrayList<>();
}
