package com.rainbowforest.aichatbotservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OpenAiChatClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.model:gpt-4o-mini}")
    private String model;

    /** true = bắt buộc có key (OpenAI, Groq…). false = gọi được không cần key (ví dụ Ollama cục bộ). */
    @Value("${openai.api.require-key:true}")
    private boolean requireKey;

    public boolean isConfigured() {
        if (!requireKey) {
            return true;
        }
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    public JsonNode completeNode(List<Object> messages, List<Map<String, Object>> tools) throws Exception {
        if (requireKey && (apiKey == null || apiKey.trim().isEmpty())) {
            throw new IllegalStateException("Chưa cấu hình openai.api.key");
        }
        Map<String, Object> body = new HashMap<String, Object>();
        body.put("model", model);
        body.put("temperature", 0.6);
        body.put("messages", messages);
        if (tools != null && !tools.isEmpty()) {
            body.put("tools", tools);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf("application/json;charset=UTF-8"));
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            headers.setBearerAuth(apiKey.trim());
        }

        HttpEntity<String> entity = new HttpEntity<String>(objectMapper.writeValueAsString(body), headers);
        ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IllegalStateException("OpenAI HTTP " + response.getStatusCode());
        }
        JsonNode root = objectMapper.readTree(response.getBody());
        JsonNode choices = root.path("choices");
        if (!choices.isArray() || choices.size() == 0) {
            throw new IllegalStateException("OpenAI không trả choices");
        }
        return choices.get(0).path("message");
    }

    public String complete(List<Map<String, String>> messages) throws Exception {
        List<Object> objectMessages = new ArrayList<>(messages);
        JsonNode message = completeNode(objectMessages, null);
        String text = message.path("content").asText("");
        if (text.isEmpty()) {
            throw new IllegalStateException("OpenAI trả nội dung rỗng");
        }
        return text.trim();
    }

    public static List<Object> buildMessagesObject(String systemText, List<Map<String, String>> historyTail, String userMessage) {
        List<Object> out = new ArrayList<>();
        Map<String, String> sys = new HashMap<>();
        sys.put("role", "system");
        sys.put("content", systemText);
        out.add(sys);
        if (historyTail != null) {
            for (Map<String, String> m : historyTail) {
                if (m == null || m.get("role") == null || m.get("content") == null) {
                    continue;
                }
                String role = m.get("role").trim().toLowerCase();
                if (!"user".equals(role) && !"assistant".equals(role)) {
                    continue;
                }
                Map<String, String> row = new HashMap<>();
                row.put("role", role);
                row.put("content", m.get("content"));
                out.add(row);
            }
        }
        Map<String, String> user = new HashMap<>();
        user.put("role", "user");
        user.put("content", userMessage);
        out.add(user);
        return out;
    }

    public static List<Map<String, String>> buildMessages(String systemText, List<Map<String, String>> historyTail, String userMessage) {
        List<Map<String, String>> out = new ArrayList<Map<String, String>>();
        Map<String, String> sys = new HashMap<String, String>();
        sys.put("role", "system");
        sys.put("content", systemText);
        out.add(sys);
        if (historyTail != null) {
            for (Map<String, String> m : historyTail) {
                if (m == null || m.get("role") == null || m.get("content") == null) {
                    continue;
                }
                String role = m.get("role").trim().toLowerCase();
                if (!"user".equals(role) && !"assistant".equals(role)) {
                    continue;
                }
                Map<String, String> row = new HashMap<String, String>();
                row.put("role", role);
                row.put("content", m.get("content"));
                out.add(row);
            }
        }
        Map<String, String> user = new HashMap<String, String>();
        user.put("role", "user");
        user.put("content", userMessage);
        out.add(user);
        return out;
    }
}
