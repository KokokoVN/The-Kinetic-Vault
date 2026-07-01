package com.rainbowforest.aichatbotservice.service;

import com.rainbowforest.aichatbotservice.client.SaleServiceClient;
import com.rainbowforest.aichatbotservice.dto.sale.SaleProgramDto;
import com.rainbowforest.aichatbotservice.dto.sale.SaleProgramItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class SaleContextService {

    private final SaleServiceClient saleServiceClient;

    /**
     * Load danh sách chương trình sale đang active từ sale-service.
     */
    public List<SaleProgramDto> loadActivePrograms() {
        try {
            List<SaleProgramDto> programs = saleServiceClient.getActivePrograms();
            return programs != null ? programs : Collections.emptyList();
        } catch (Exception e) {
            // sale-service chưa chạy hoặc lỗi mạng — bỏ qua, chatbot vẫn hoạt động
            return Collections.emptyList();
        }
    }

    /**
     * Format danh sách sale program thành text block cho system prompt.
     */
    public String formatSaleForSystemPrompt(List<SaleProgramDto> programs) {
        if (programs == null || programs.isEmpty()) {
            return "(Hiện không có chương trình khuyến mãi nào đang chạy.)";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("(Dữ liệu khuyến mãi đang chạy — không in nguyên cấu trúc, chỉ dùng để trả lời tự nhiên cho khách.)");
        sb.append(System.lineSeparator());

        for (SaleProgramDto p : programs) {
            sb.append(System.lineSeparator());
            sb.append("★ CTKM: ").append(safe(p.getName()));

            // Discount info
            if ("PERCENT".equalsIgnoreCase(p.getDiscountType()) && p.getDiscountValue() != null) {
                sb.append(" — Giảm ").append(p.getDiscountValue().stripTrailingZeros().toPlainString()).append("%");
            } else if ("AMOUNT".equalsIgnoreCase(p.getDiscountType()) && p.getDiscountValue() != null) {
                sb.append(" — Ưu đãi đồng giá: ").append(formatVnd(p.getDiscountValue())).append(" (Lưu ý: đây là giá bán sau khuyến mãi cố định, KHÔNG PHẢI số tiền được giảm trừ đi giá gốc)");
            }

            // Time range
            if (p.getStartAt() != null && p.getEndAt() != null) {
                sb.append(" — Từ ").append(p.getStartAt()).append(" đến ").append(p.getEndAt());
            }

            sb.append(System.lineSeparator());

            // Description
            if (p.getDescription() != null && !p.getDescription().trim().isEmpty()) {
                String desc = p.getDescription().trim();
                if (desc.length() > 150) {
                    desc = desc.substring(0, 147) + "...";
                }
                sb.append("  Mô tả: ").append(desc).append(System.lineSeparator());
            }

            // Applicable items
            if (p.getItems() != null && !p.getItems().isEmpty()) {
                sb.append("  Áp dụng cho ");
                if (p.getItems().size() <= 10) {
                    for (int i = 0; i < p.getItems().size(); i++) {
                        SaleProgramItemDto item = p.getItems().get(i);
                        if (i > 0) sb.append(", ");
                        if (item.getProductName() != null && !item.getProductName().isEmpty()) {
                            sb.append(item.getProductName());
                        } else {
                            sb.append("SP #").append(item.getProductId());
                        }
                    }
                } else {
                    sb.append(p.getItems().size()).append(" sản phẩm");
                }
                sb.append(System.lineSeparator());
            }
        }

        return sb.toString().trim();
    }

    private static String formatVnd(BigDecimal amount) {
        if (amount == null) return "?";
        return String.format(Locale.ROOT, "%,.0f ₫", amount.doubleValue());
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }
}
