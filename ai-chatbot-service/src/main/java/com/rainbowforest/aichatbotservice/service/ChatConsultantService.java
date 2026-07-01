package com.rainbowforest.aichatbotservice.service;

import com.rainbowforest.aichatbotservice.dto.catalog.CatalogProductDto;
import com.rainbowforest.aichatbotservice.dto.chat.ChatMessageDto;
import com.rainbowforest.aichatbotservice.dto.chat.ChatRequest;
import com.rainbowforest.aichatbotservice.dto.chat.ChatResponse;
import com.rainbowforest.aichatbotservice.dto.sale.SaleProgramDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatConsultantService {

    private static final int MAX_HISTORY_TURNS = 10;

    private final CatalogContextService catalogContextService;
    private final SaleContextService saleContextService;
    private final OpenAiChatClient openAiChatClient;
    private final com.rainbowforest.aichatbotservice.client.ProductCatalogClient productCatalogClient;
    private final com.rainbowforest.aichatbotservice.client.CartClient cartClient;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public ChatResponse consult(ChatRequest request, String cookieHeader) {
        // Load catalog
        List<CatalogProductDto> products = catalogContextService.loadCatalogForPrompt();

        // Load sale programs
        List<SaleProgramDto> salePrograms = saleContextService.loadActivePrograms();

        // Merge: Apply sale price to products
        if (products != null) {
            for (CatalogProductDto p : products) {
                BigDecimal basePrice = p.getMinVariantPrice() != null ? p.getMinVariantPrice() : p.getPrice();
                BigDecimal bestPrice = basePrice;
                if (salePrograms != null) {
                    for (SaleProgramDto sp : salePrograms) {
                        if (sp.getItems() != null) {
                            for (com.rainbowforest.aichatbotservice.dto.sale.SaleProgramItemDto spi : sp.getItems()) {
                                if (spi.getProductId() != null && spi.getProductId().equals(p.getId())) {
                                    if ("AMOUNT".equalsIgnoreCase(sp.getDiscountType()) && sp.getDiscountValue() != null) {
                                        bestPrice = sp.getDiscountValue();
                                    } else if ("PERCENT".equalsIgnoreCase(sp.getDiscountType()) && sp.getDiscountValue() != null) {
                                        BigDecimal discountVal = basePrice.multiply(sp.getDiscountValue()).divide(new BigDecimal("100"), java.math.RoundingMode.HALF_UP);
                                        BigDecimal salePrice = basePrice.subtract(discountVal);
                                        if (salePrice.compareTo(bestPrice) < 0) {
                                            bestPrice = salePrice;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                p.setEffectivePrice(bestPrice);
            }
        }

        String catalogBlock = catalogContextService.formatCatalogForSystemPrompt(products);
        String saleBlock = saleContextService.formatSaleForSystemPrompt(salePrograms);

        // Build enhanced system prompt
        String system = buildSystemPrompt(catalogBlock, saleBlock);

        List<Map<String, String>> historyMaps = trimHistory(request.getHistory());

        if (!openAiChatClient.isConfigured()) {
            return new ChatResponse(demoReply(request.getMessage(), products, salePrograms), true);
        }

        try {
            List<Object> messages = OpenAiChatClient.buildMessagesObject(
                    system,
                    historyMaps,
                    request.getMessage()
            );

            // Define tools
            List<Map<String, Object>> tools = new ArrayList<>();
            Map<String, Object> tool = new HashMap<>();
            tool.put("type", "function");
            Map<String, Object> func = new HashMap<>();
            func.put("name", "getProductDetails");
            func.put("description", "Lấy toàn bộ thông tin chi tiết của 1 sản phẩm (bao gồm các biến thể màu sắc, kích cỡ, tồn kho từng loại).");
            Map<String, Object> params = new HashMap<>();
            params.put("type", "object");
            Map<String, Object> props = new HashMap<>();
            Map<String, Object> pId = new HashMap<>();
            pId.put("type", "integer");
            pId.put("description", "ID của sản phẩm (ví dụ: 4042)");
            props.put("productId", pId);
            params.put("properties", props);
            params.put("required", List.of("productId"));
            func.put("parameters", params);
            tool.put("function", func);
            tools.add(tool);

            Map<String, Object> cartTool = new HashMap<>();
            cartTool.put("type", "function");
            Map<String, Object> cartFunc = new HashMap<>();
            cartFunc.put("name", "getShoppingCart");
            cartFunc.put("description", "Truy xuất giỏ hàng hiện tại của khách hàng. Trả về danh sách sản phẩm trong giỏ và tổng tiền.");
            Map<String, Object> cartParams = new HashMap<>();
            cartParams.put("type", "object");
            cartParams.put("properties", new HashMap<>());
            cartFunc.put("parameters", cartParams);
            cartTool.put("function", cartFunc);
            tools.add(cartTool);

            int maxTurns = 5;
            while (maxTurns-- > 0) {
                com.fasterxml.jackson.databind.JsonNode messageNode = openAiChatClient.completeNode(messages, tools);
                
                if (messageNode.has("tool_calls") && messageNode.get("tool_calls").isArray() && messageNode.get("tool_calls").size() > 0) {
                    // Add assistant tool_calls message to history
                    messages.add(messageNode);
                    
                    com.fasterxml.jackson.databind.JsonNode toolCalls = messageNode.get("tool_calls");
                    for (com.fasterxml.jackson.databind.JsonNode call : toolCalls) {
                        String callId = call.path("id").asText();
                        String name = call.path("function").path("name").asText();
                        String args = call.path("function").path("arguments").asText();
                        
                        String toolResult = "";
                        try {
                            if ("getProductDetails".equals(name)) {
                                com.fasterxml.jackson.databind.JsonNode argsNode = objectMapper.readTree(args);
                                Long productId = argsNode.path("productId").asLong();
                                Map<String, Object> product = productCatalogClient.getProductById(productId);
                                List<Map<String, Object>> variants = productCatalogClient.getVariantsForProduct(productId);
                                Map<String, Object> result = new HashMap<>();
                                result.put("product", product);
                                result.put("variants", variants);
                                toolResult = objectMapper.writeValueAsString(result);
                            } else if ("getShoppingCart".equals(name)) {
                                Map<String, Object> cartItems = cartClient.getCartItems(cookieHeader);
                                toolResult = objectMapper.writeValueAsString(cartItems);
                            } else {
                                toolResult = "{\"error\": \"Unknown function\"}";
                            }
                        } catch (Exception ex) {
                            toolResult = "{\"error\": \"" + ex.getMessage() + "\"}";
                        }
                        
                        Map<String, Object> toolMessage = new HashMap<>();
                        toolMessage.put("role", "tool");
                        toolMessage.put("tool_call_id", callId);
                        toolMessage.put("content", toolResult);
                        messages.add(toolMessage);
                    }
                } else {
                    return new ChatResponse(messageNode.path("content").asText(""), false);
                }
            }
            return new ChatResponse("AI đang xử lý quá lâu, vui lòng thử lại.", false);
        } catch (Exception e) {
            return new ChatResponse(friendlyLlmFailureMessage(e), false);
        }
    }

    /**
     * System prompt nâng cao: tư vấn sản phẩm + khuyến mãi + CSKH + đề xuất theo nhu cầu.
     */
    private static String buildSystemPrompt(String catalogBlock, String saleBlock) {
        return "Bạn là trợ lý tư vấn AI của cửa hàng thương mại điện tử. Bạn có 4 vai trò chính:\n\n"

                + "**1. Tư vấn sản phẩm:**\n"
                + "- Giới thiệu và so sánh sản phẩm dựa trên catalog bên dưới.\n"
                + "- Chỉ trả lời dựa trên dữ liệu thực; không bịa thêm sản phẩm, giá hay tồn kho.\n"
                + "- Khi gợi ý sản phẩm, nêu tên và giá (định dạng tiền dễ đọc, ví dụ «499.000 ₫»).\n\n"

                + "**2. Tư vấn chương trình khuyến mãi:**\n"
                + "- Thông tin về các CTKM đang chạy được cung cấp bên dưới.\n"
                + "- Nếu sản phẩm đang được giảm giá (có cả Giá gốc và Giá sale), BẮT BUỘC phải thông báo cho khách hàng cả giá gốc và giá sale để khách hàng thấy được mức ưu đãi (ví dụ: Sản phẩm đang có giá gốc là 199.000đ, hiện được sale chỉ còn 159.000đ).\n"
                + "- TUYỆT ĐỐI KHÔNG TỰ TÍNH TOÁN LẠI HAY SUY DIỄN GIÁ. Chỉ được phép báo đúng nguyên văn mức giá đã được tính sẵn ở phần \"Giá:\" trong danh sách sản phẩm bên dưới.\n"
                + "- Nếu có CTKM phù hợp với sản phẩm khách hỏi, chủ động giới thiệu.\n"
                + "- So sánh giá gốc vs giá sau khuyến mãi nếu có thể.\n"
                + "- Nếu không có CTKM nào đang chạy, nói rõ và gợi ý khách theo dõi.\n\n"

                + "**3. Hỗ trợ khách hàng:**\n"
                + "- Hướng dẫn cách đặt hàng, thanh toán, tra cứu vận đơn.\n"
                + "- Giải đáp thắc mắc về chính sách chung (đổi trả, bảo hành, giao hàng).\n"
                + "- Nếu vấn đề phức tạp vượt khả năng, hướng khách liên hệ bộ phận CSKH.\n\n"

                + "**4. Đề xuất sản phẩm theo nhu cầu:**\n"
                + "- Khi khách hỏi chung chung (ví dụ: \"tìm quà tặng\", \"muốn mua dưới 500k\"), phân tích nhu cầu.\n"
                + "- Gợi ý 2-4 sản phẩm phù hợp kèm lý do ngắn gọn.\n"
                + "- Ưu tiên sản phẩm đang có khuyến mãi nếu phù hợp.\n\n"

                + "**Quy tắc trình bày:**\n"
                + "- Trả lời bằng tiếng Việt, ngắn gọn, lịch sự, giọng tự nhiên như nhắn tin tư vấn.\n"
                + "- Không copy nguyên cấu trúc dữ liệu nội bộ (pipe |, nhãn SKU, id=, v.v.).\n"
                + "- Không nhắc id, SKU, mức tồn chi tiết — trừ khi khách hỏi rõ.\n"
                + "- Nếu khách muốn biết thêm về một sản phẩm cụ thể, dùng function 'getProductDetails' truyền vào id của sản phẩm.\n"
                + "- Nếu khách hỏi về giỏ hàng (trong giỏ hàng có gì, tổng tiền), dùng function 'getShoppingCart' để lấy thông tin giỏ hàng của khách.\n\n"

                + "=== DỮ LIỆU SẢN PHẨM ===\n" + catalogBlock + "\n\n"
                + "=== CHƯƠNG TRÌNH KHUYẾN MÃI ===\n" + saleBlock;
    }

    /** Thông báo ngắn gọn cho khách; riêng lỗi Ollama offline thì hướng dẫn bật dịch vụ. */
    private static String friendlyLlmFailureMessage(Throwable e) {
        String blob = "";
        for (Throwable t = e; t != null; t = t.getCause()) {
            String m = t.getMessage();
            if (m != null) {
                blob = blob + " " + m;
            }
        }
        String lower = blob.toLowerCase(Locale.ROOT);
        if (lower.contains("connection refused")
                && (lower.contains("11434") || lower.contains("localhost") || lower.contains("127.0.0.1"))) {
            return "Hiện không kết nối được Ollama (LLM cục bộ, cổng 11434). "
                    + "Cách xử lý: (1) Mở ứng dụng Ollama trên Windows (icon khay hệ thống) hoặc chạy lệnh ollama serve trong terminal. "
                    + "(2) Nếu chưa có model: ollama pull llama3.2. "
                    + "(3) Mở trình duyệt tới http://127.0.0.1:11434 để kiểm tra đã chạy chưa, rồi thử chat lại.";
        }
        String tail = e.getMessage() != null && e.getMessage().length() < 220
                ? e.getMessage()
                : (e.getClass().getSimpleName());
        if (lower.contains("429") || lower.contains("too many requests")) {
            return "Hệ thống AI đang quá tải do giới hạn số lượt hỏi (Rate Limit). Bạn vui lòng đợi khoảng 30 giây rồi thử chat lại nhé.";
        }
        return "Xin lỗi, hệ thống tư vấn AI đang gặp sự cố. Bạn có thể thử lại sau. (" + tail + ")";
    }

    private static List<Map<String, String>> trimHistory(List<ChatMessageDto> history) {
        if (history == null || history.isEmpty()) {
            return new ArrayList<Map<String, String>>();
        }
        int from = Math.max(0, history.size() - MAX_HISTORY_TURNS);
        List<Map<String, String>> maps = new ArrayList<Map<String, String>>();
        for (int i = from; i < history.size(); i++) {
            ChatMessageDto dto = history.get(i);
            if (dto == null || dto.getRole() == null || dto.getContent() == null) {
                continue;
            }
            Map<String, String> m = new HashMap<String, String>();
            m.put("role", dto.getRole());
            m.put("content", dto.getContent());
            maps.add(m);
        }
        return maps;
    }

    /**
     * Demo reply khi chưa cấu hình API key — nay có thêm thông tin sale.
     */
    private static String demoReply(String userMessage, List<CatalogProductDto> products, List<SaleProgramDto> salePrograms) {
        String q = userMessage == null ? "" : userMessage.toLowerCase(Locale.ROOT).trim();

        // Nếu hỏi về khuyến mãi
        boolean asksPromo = q.contains("khuyến mãi") || q.contains("khuyen mai") || q.contains("giảm giá")
                || q.contains("giam gia") || q.contains("sale") || q.contains("ưu đãi") || q.contains("voucher");

        if (asksPromo && salePrograms != null && !salePrograms.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            sb.append("[Chế độ demo] Hiện có ").append(salePrograms.size()).append(" chương trình khuyến mãi đang chạy:\n\n");
            for (SaleProgramDto p : salePrograms) {
                sb.append("🎉 ").append(p.getName());
                if ("PERCENT".equalsIgnoreCase(p.getDiscountType()) && p.getDiscountValue() != null) {
                    sb.append(" — Giảm ").append(p.getDiscountValue().stripTrailingZeros().toPlainString()).append("%");
                } else if ("AMOUNT".equalsIgnoreCase(p.getDiscountType()) && p.getDiscountValue() != null) {
                    sb.append(" — Ưu đãi đồng giá ").append(String.format(Locale.US, "%,.0f ₫", p.getDiscountValue().doubleValue()));
                }
                sb.append("\n\n");
            }
            sb.append("Đặt OPENAI_API_KEY để bật tư vấn AI đầy đủ.");
            return sb.toString().trim();
        }

        // Tìm sản phẩm
        List<CatalogProductDto> match;
        if (q.isEmpty()) {
            match = products.stream().limit(5).collect(Collectors.toList());
        } else {
            match = products.stream()
                    .filter(p -> contains(p.getProductName(), q) || contains(p.getSku(), q) || contains(p.getCategory(), q))
                    .limit(8)
                    .collect(Collectors.toList());
        }
        if (match.isEmpty()) {
            return "[Chế độ demo — chưa cấu hình openai.api.key] Không tìm thấy sản phẩm khớp từ khóa. "
                    + "Hãy thử mô tả khác hoặc cấu hình API key để bật tư vấn AI đầy đủ.";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("[Chế độ demo — chưa cấu hình openai.api.key] Mình gợi ý vài món phù hợp trong catalog:\n\n");
        for (CatalogProductDto p : match) {
            BigDecimal gia = p.getEffectivePrice() != null ? p.getEffectivePrice() : p.getPrice();
            String tien = gia != null ? String.format(Locale.US, "%,.0f ₫", gia.doubleValue()) : "?";
            sb.append("• ").append(p.getProductName()).append(" — ").append(tien).append("\n\n");
        }
        sb.append("\nĐặt OPENAI_API_KEY (hoặc openai.api.key trong application.properties) để có hội thoại tự nhiên hơn.");
        return sb.toString().trim();
    }

    private static boolean contains(String field, String q) {
        if (field == null) {
            return false;
        }
        return field.toLowerCase(Locale.ROOT).contains(q);
    }
}
