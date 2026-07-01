package com.rainbowforest.aichatbotservice.service;

import com.rainbowforest.aichatbotservice.client.ProductCatalogClient;
import com.rainbowforest.aichatbotservice.dto.catalog.CatalogProductDto;
import com.rainbowforest.aichatbotservice.dto.catalog.ProductSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogContextService {

    private final ProductCatalogClient productCatalogClient;

    @Value("${chatbot.catalog.max-products:80}")
    private int maxProducts;

    public List<CatalogProductDto> loadCatalogForPrompt() {
        try {
            ProductSearchResponse res = productCatalogClient.searchProducts("", "all", 1, Math.max(maxProducts, 5));
            if (res == null || res.getItems() == null) {
                return Collections.emptyList();
            }
            return res.getItems().stream().limit(maxProducts).collect(Collectors.toList());
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public String formatCatalogForSystemPrompt(List<CatalogProductDto> products) {
        if (products.isEmpty()) {
            return "(Hiện không lấy được danh sách sản phẩm từ catalog — hãy thông báo khách thử lại sau.)";
        }
        NumberFormat vn = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        StringBuilder sb = new StringBuilder();
        sb.append("(Dữ liệu tham khảo cho model — không in nguyên cấu trúc các dòng này vào tin khách.)").append(System.lineSeparator());
        for (CatalogProductDto p : products) {
            BigDecimal baseGia = p.getMinVariantPrice() != null ? p.getMinVariantPrice() : p.getPrice();
            BigDecimal gia = p.getEffectivePrice() != null ? p.getEffectivePrice() : baseGia;
            
            String giaChu;
            if (baseGia != null && gia != null && gia.compareTo(baseGia) < 0) {
                giaChu = String.format(Locale.ROOT, "Giá gốc: %s ₫ - Giá sale: %s ₫", vn.format(baseGia), vn.format(gia));
            } else if (baseGia != null) {
                giaChu = String.format(Locale.ROOT, "%s ₫", vn.format(baseGia));
            } else {
                giaChu = "?";
            }
            
            String ton = p.getAvailability() != null ? p.getAvailability().toString() : "?";
            sb.append(String.format(
                    Locale.ROOT,
                    "• ID: %d | Tên SP: %s | Giá: %s | Tồn: %s | Nhóm: %s%n",
                    p.getId(),
                    safe(p.getProductName()),
                    giaChu,
                    ton,
                    safe(p.getCategory())
            ));
        }
        return sb.toString().trim();
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }
}
