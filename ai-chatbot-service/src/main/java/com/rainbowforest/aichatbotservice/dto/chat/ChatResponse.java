package com.rainbowforest.aichatbotservice.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String reply;
    /** true khi không có OPENAI_API_KEY — trả lời mẫu */
    private boolean demoMode;
}
