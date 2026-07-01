package com.rainbowforest.telegramservice.bot;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.rainbowforest.telegramservice.client.ProductClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.CallbackQuery;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.ArrayList;
import java.util.List;

@Component
public class ProductEditBotHandler {

    @Autowired
    private ProductClient productClient;

    public void handleText(Long chatId, String text, UserSession session, AdminTelegramBot bot, String username, String userId) {
        if (text.startsWith("/product ")) {
            String[] parts = text.split(" ");
            if (parts.length > 1) {
                try {
                    Long id = Long.parseLong(parts[1]);
                    sendProductDetails(chatId, id, bot);
                } catch (NumberFormatException e) {
                    bot.sendMessage(chatId, "ID không hợp lệ.");
                }
            }
            return;
        }

        if (text.startsWith("/search ")) {
            String q = text.substring("/search ".length()).trim();
            if (q.isEmpty()) {
                bot.sendMessage(chatId, "Vui lòng nhập từ khóa. Ví dụ: /search Áo thun");
                return;
            }
            sendProductPage(chatId, 0, q, bot);
            return;
        }

        // Handle states
        if (session.getState() == BotState.WAITING_FOR_PRODUCT_NAME) {
            try {
                JsonNode searchResult = productClient.getProducts(0, 50, text.trim());
                if (searchResult != null && searchResult.has("content")) {
                    for (JsonNode item : searchResult.get("content")) {
                        if (item.has("productName") && item.get("productName").asText().equalsIgnoreCase(text.trim())) {
                            if (item.get("id").asLong() != session.getTargetProductId()) {
                                bot.sendMessage(chatId, "❌ Lỗi: Tên sản phẩm '" + text.trim() + "' đã tồn tại! Vui lòng nhập tên khác:");
                                return;
                            }
                        }
                    }
                }
            } catch (Exception e) {}
            updateProductField(chatId, session.getTargetProductId(), "productName", text, bot, username, userId);
            session.clear();
        } else if (session.getState() == BotState.WAITING_FOR_PRODUCT_PRICE) {
            try {
                Double price = Double.parseDouble(text);
                if (price < 0) {
                    bot.sendMessage(chatId, "Giá không được nhỏ hơn 0. Vui lòng nhập lại:");
                    return;
                }
                updateProductField(chatId, session.getTargetProductId(), "price", price, bot, username, userId);
                session.clear();
            } catch (NumberFormatException e) {
                bot.sendMessage(chatId, "Giá không hợp lệ. Vui lòng nhập số:");
            }
        } else if (session.getState() == BotState.WAITING_FOR_PRODUCT_QUANTITY) {
            try {
                int quantity = Integer.parseInt(text.trim());
                if (quantity < 0) {
                    bot.sendMessage(chatId, "Số lượng không được nhỏ hơn 0. Vui lòng nhập lại:");
                    return;
                }
                updateProductField(chatId, session.getTargetProductId(), "availability", quantity, bot, username, userId);
                session.clear();
            } catch (NumberFormatException e) {
                bot.sendMessage(chatId, "Số lượng không hợp lệ. Vui lòng nhập số:");
            }
        } else if (session.getState() == BotState.WAITING_FOR_VARIANT_INFO) {
            String[] parts = text.split(",");
            if (parts.length != 4) {
                bot.sendMessage(chatId, "Sai format. Vui lòng nhập lại (VD: L, Trắng, 200000, 50):");
                return;
            }
            try {
                String size = parts[0].trim();
                String color = parts[1].trim();
                Double price = Double.parseDouble(parts[2].trim());
                int quantity = Integer.parseInt(parts[3].trim());
                
                JsonNode existingVariants = productClient.getProductVariants(session.getTargetProductId());
                if (existingVariants != null && existingVariants.isArray()) {
                    for (JsonNode v : existingVariants) {
                        String exSize = v.hasNonNull("size") ? v.get("size").asText() : "";
                        String exColor = v.hasNonNull("color") ? v.get("color").asText() : "";
                        if (exSize.equalsIgnoreCase(size) && exColor.equalsIgnoreCase(color)) {
                            bot.sendMessage(chatId, "❌ Lỗi: Biến thể Kích thước '" + size + "' và Màu '" + color + "' đã tồn tại! Vui lòng nhập khác:");
                            return;
                        }
                    }
                }

                ObjectMapper mapper = new ObjectMapper();
                ObjectNode variant = mapper.createObjectNode();
                variant.put("size", size);
                variant.put("color", color);
                variant.put("price", price);
                variant.put("availability", quantity);

                productClient.addVariant(session.getTargetProductId(), variant, username, userId);
                bot.sendMessage(chatId, "✅ Thêm biến thể thành công!");
                sendProductDetails(chatId, session.getTargetProductId(), bot);
                session.clear();
            } catch (Exception e) {
                bot.sendMessage(chatId, "Lỗi khi thêm biến thể: " + e.getMessage());
            }
        } else if (session.getState() == BotState.WAITING_FOR_SPEC_INFO) {
            String[] parts = text.split(",");
            if (parts.length < 3) {
                bot.sendMessage(chatId, "Sai format. Vui lòng nhập lại (VD: Chất liệu, Thành phần, Cotton, 100%):");
                return;
            }
            try {
                JsonNode existing = productClient.getProductById(session.getTargetProductId());
                if (existing != null && existing.has("technicalSpecs") && existing.get("technicalSpecs").size() >= 5) {
                    bot.sendMessage(chatId, "❌ Sản phẩm đã đạt số lượng thông số kỹ thuật tối đa (5 nhóm). Vui lòng xóa bớt trước khi thêm mới.");
                    session.clear();
                    return;
                }

                String group = parts[0].trim();
                String name = parts[1].trim();
                String value = parts[2].trim();
                String unit = parts.length > 3 ? parts[3].trim() : "";
                
                ObjectMapper mapper = new ObjectMapper();
                ObjectNode spec = mapper.createObjectNode();
                spec.put("specGroup", group);
                spec.put("specKey", name);
                spec.put("specValue", value);
                spec.put("specUnit", unit);

                productClient.addSpec(session.getTargetProductId(), spec, username, userId);
                bot.sendMessage(chatId, "✅ Thêm thông số thành công!");
                sendProductDetails(chatId, session.getTargetProductId(), bot);
                session.clear();
            } catch (Exception e) {
                bot.sendMessage(chatId, "Lỗi khi thêm thông số: " + e.getMessage());
            }
        } else if (session.getState() == BotState.WAITING_FOR_PRIMARY_IMAGE) {
            try {
                Long imageId = Long.parseLong(text.trim());
                productClient.setPrimaryImage(session.getTargetProductId(), imageId, username, userId);
                bot.sendMessage(chatId, "✅ Đã đặt ảnh/video làm mặc định!");
                sendProductDetails(chatId, session.getTargetProductId(), bot);
                session.clear();
            } catch (Exception e) {
                bot.sendMessage(chatId, "Lỗi: " + e.getMessage());
            }
        } else if (session.getState() == BotState.WAITING_FOR_DELETE_VAR_SPEC) {
            try {
                String[] parts = text.split("_", 2);
                if (parts.length != 2) {
                    bot.sendMessage(chatId, "Sai format. Vui lòng nhập V_<ID> hoặc S_<ID>");
                    return;
                }
                String type = parts[0].trim().toUpperCase();
                Long targetId = Long.parseLong(parts[1].trim());
                
                if ("V".equals(type)) {
                    productClient.deleteVariant(session.getTargetProductId(), targetId, username, userId);
                    bot.sendMessage(chatId, "✅ Đã xóa biến thể thành công!");
                } else if ("S".equals(type)) {
                    productClient.deleteSpec(session.getTargetProductId(), targetId, username, userId);
                    bot.sendMessage(chatId, "✅ Đã xóa thông số thành công!");
                } else {
                    bot.sendMessage(chatId, "Vui lòng nhập bắt đầu bằng V_ hoặc S_");
                    return;
                }
                sendProductDetails(chatId, session.getTargetProductId(), bot);
                session.clear();
            } catch (Exception e) {
                bot.sendMessage(chatId, "Lỗi khi xóa: " + e.getMessage());
            }
        }
    }

    public void handleCallback(CallbackQuery query, UserSession session, AdminTelegramBot bot) {
        String data = query.getData();
        Long chatId = query.getMessage().getChatId();

        if (data.startsWith("VIEW_PROD_")) {
            Long id = Long.parseLong(data.substring("VIEW_PROD_".length()));
            sendProductDetails(chatId, id, bot);
        } else if (data.startsWith("VIEW_MEDIA_")) {
            Long id = Long.parseLong(data.substring("VIEW_MEDIA_".length()));
            bot.sendMessage(chatId, "⏳ Đang tải ảnh/video từ hệ thống...");
            try {
                JsonNode images = productClient.getProductImages(id);
                bot.sendMediaList(chatId, images);
            } catch (Exception e) {
                bot.sendMessage(chatId, "❌ Lỗi khi tải ảnh: " + e.getMessage());
            }
        } else if (data.startsWith("EDIT_NAME_")) {
            Long id = Long.parseLong(data.substring("EDIT_NAME_".length()));
            session.setState(BotState.WAITING_FOR_PRODUCT_NAME);
            session.setTargetProductId(id);
            bot.sendMessage(chatId, "Vui lòng nhập tên mới cho sản phẩm:");
        } else if (data.startsWith("EDIT_PRICE_")) {
            Long id = Long.parseLong(data.substring("EDIT_PRICE_".length()));
            session.setState(BotState.WAITING_FOR_PRODUCT_PRICE);
            session.setTargetProductId(id);
            bot.sendMessage(chatId, "Vui lòng nhập giá mới cho sản phẩm (VND):");
        } else if (data.startsWith("EDIT_QUANTITY_")) {
            Long id = Long.parseLong(data.substring("EDIT_QUANTITY_".length()));
            session.setState(BotState.WAITING_FOR_PRODUCT_QUANTITY);
            session.setTargetProductId(id);
            bot.sendMessage(chatId, "Vui lòng nhập Số lượng (Kho) mới cho sản phẩm:");
        } else if (data.startsWith("ADD_VARIANT_")) {
            Long id = Long.parseLong(data.substring("ADD_VARIANT_".length()));
            session.setState(BotState.WAITING_FOR_VARIANT_INFO);
            session.setTargetProductId(id);
            bot.sendMessage(chatId, "Vui lòng nhập thông tin biến thể theo format:\nKích thước, Màu sắc, Giá biến thể, Số lượng\n\nVí dụ: L, Trắng, 200000, 50");
        } else if (data.startsWith("ADD_SPEC_")) {
            Long id = Long.parseLong(data.substring("ADD_SPEC_".length()));
            session.setState(BotState.WAITING_FOR_SPEC_INFO);
            session.setTargetProductId(id);
            bot.sendMessage(chatId, "Vui lòng nhập thông số theo format:\nNhóm, Tên, Giá trị, Đơn vị (nếu có)\n\nVí dụ: Chất liệu, Thành phần, Cotton, 100%");
        } else if (data.startsWith("UPLOAD_MEDIA_")) {
            Long id = Long.parseLong(data.substring("UPLOAD_MEDIA_".length()));
            session.setState(BotState.WAITING_FOR_PRODUCT_MEDIA);
            session.setTargetProductId(id);
            bot.sendMessage(chatId, "Vui lòng gửi 1 bức ảnh (Image) hoặc Video cho sản phẩm này:");
        } else if (data.startsWith("SET_PRIMARY_")) {
            Long id = Long.parseLong(data.substring("SET_PRIMARY_".length()));
            session.setState(BotState.WAITING_FOR_PRIMARY_IMAGE);
            session.setTargetProductId(id);
            bot.sendMessage(chatId, "Vui lòng nhập ID của Ảnh/Video bạn muốn đặt làm Mặc định:");
        } else if (data.startsWith("DELETE_VAR_SPEC_")) {
            Long id = Long.parseLong(data.substring("DELETE_VAR_SPEC_".length()));
            session.setState(BotState.WAITING_FOR_DELETE_VAR_SPEC);
            session.setTargetProductId(id);
            bot.sendMessage(chatId, "Vui lòng nhập định dạng: V_<ID> để xóa Biến thể, hoặc S_<ID> để xóa Thông số.\nVí dụ: V_101 hoặc S_52");
        } else if (data.startsWith("DELETE_PROD_")) {
            Long id = Long.parseLong(data.substring("DELETE_PROD_".length()));
            String username = query.getFrom().getUserName();
            String userId = String.valueOf(query.getFrom().getId());
            try {
                productClient.deleteProduct(id, username, userId);
                bot.sendMessage(chatId, "✅ Đã xóa sản phẩm thành công!");
                sendProductPage(chatId, 0, bot);
            } catch (Exception e) {
                bot.sendMessage(chatId, "❌ Lỗi khi xóa sản phẩm: " + e.getMessage());
            }
        } else if (data.startsWith("PAGE_")) {
            String[] parts = data.split("_", 3);
            int page = Integer.parseInt(parts[1]);
            String q = parts.length > 2 ? parts[2] : null;
            sendProductPage(chatId, page, q, bot);
        }
    }

    public void sendProductPage(Long chatId, int page, AdminTelegramBot bot) {
        sendProductPage(chatId, page, null, bot);
    }

    public void sendProductPage(Long chatId, int page, String q, AdminTelegramBot bot) {
        try {
            JsonNode productsNode = productClient.getProducts(page, 5, q);
            StringBuilder sb = new StringBuilder("🛍 **Danh sách Sản phẩm (Trang " + (page + 1) + "):**\n");
            if (q != null) sb.append("Từ khóa: ").append(q).append("\n");
            sb.append("\n");
            
            InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
            List<List<InlineKeyboardButton>> rows = new ArrayList<>();
            
            if (productsNode != null && productsNode.has("content")) {
                for (JsonNode item : productsNode.get("content")) {
                    String name = item.has("productName") ? item.get("productName").asText() : "N/A";
                    String price = item.has("price") ? item.get("price").asText() + "đ" : "N/A";
                    Long id = item.get("id").asLong();
                    sb.append("- ").append(name).append(" (").append(price).append(")\n");
                    
                    List<InlineKeyboardButton> row = new ArrayList<>();
                    InlineKeyboardButton btn = new InlineKeyboardButton();
                    btn.setText("Xem chi tiết " + name);
                    btn.setCallbackData("VIEW_PROD_" + id);
                    row.add(btn);
                    rows.add(row);
                }
            } else {
                sb.append("Không có sản phẩm nào.");
            }

            // Pagination buttons
            List<InlineKeyboardButton> navRow = new ArrayList<>();
            String qSuffix = q != null ? "_" + q : "";
            if (page > 0) {
                InlineKeyboardButton btnPrev = new InlineKeyboardButton();
                btnPrev.setText("<< Trang trước");
                btnPrev.setCallbackData("PAGE_" + (page - 1) + qSuffix);
                navRow.add(btnPrev);
            }
            if (productsNode != null && productsNode.has("last") && !productsNode.get("last").asBoolean()) {
                InlineKeyboardButton btnNext = new InlineKeyboardButton();
                btnNext.setText("Trang sau >>");
                btnNext.setCallbackData("PAGE_" + (page + 1) + qSuffix);
                navRow.add(btnNext);
            }
            if (!navRow.isEmpty()) {
                rows.add(navRow);
            }
            
            markup.setKeyboard(rows);
            
            SendMessage message = new SendMessage();
            message.setChatId(chatId.toString());
            message.setText(sb.toString());
            message.setReplyMarkup(markup);
            bot.execute(message);
        } catch (Exception e) {
            e.printStackTrace();
            bot.sendMessage(chatId, "Lỗi khi lấy danh sách sản phẩm: " + e.getClass().getName() + " - " + e.getMessage());
        }
    }

    private void sendProductDetails(Long chatId, Long id, AdminTelegramBot bot) {
        try {
            JsonNode p = productClient.getProductById(id);
            if (p == null) {
                bot.sendMessage(chatId, "Không tìm thấy sản phẩm.");
                return;
            }
            
            String name = p.has("productName") ? p.get("productName").asText() : "N/A";
            String sku = p.has("sku") ? p.get("sku").asText() : "N/A";
            String price = p.has("price") ? p.get("price").asText() + "đ" : "N/A";
            
            StringBuilder sb = new StringBuilder();
            sb.append("📦 **Chi tiết Sản phẩm:**\n");
            sb.append("ID: ").append(id).append("\n");
            sb.append("Tên: ").append(name).append("\n");
            sb.append("SKU: ").append(sku).append("\n");
            sb.append("Giá: ").append(price).append("\n");
            sb.append("Kho: ").append(p.hasNonNull("availability") ? p.get("availability").asText() : "0").append("\n");
            
            JsonNode variants = productClient.getProductVariants(id);
            if (variants != null && variants.isArray() && variants.size() > 0) {
                sb.append("\n🌈 **Biến thể:**\n");
                for (JsonNode v : variants) {
                    String vColor = v.hasNonNull("color") ? v.get("color").asText() : "";
                    String vSize = v.hasNonNull("size") ? v.get("size").asText() : "";
                    String vPrice = v.hasNonNull("price") ? v.get("price").asText() + "đ" : "N/A";
                    String vAvail = v.hasNonNull("availability") ? v.get("availability").asText() : "0";
                    
                    String vId = v.hasNonNull("id") ? v.get("id").asText() : "?";
                    sb.append("- [ID: ").append(vId).append("] ").append(vColor).append(" / ").append(vSize)
                      .append(" (").append(vPrice).append(" - Kho: ").append(vAvail).append(")\n");
                }
            }

            JsonNode specs = productClient.getProductSpecs(id);
            if (specs != null && specs.isArray() && specs.size() > 0) {
                sb.append("\n⚙️ **Thông số kỹ thuật:**\n");
                for (JsonNode s : specs) {
                    String sId = s.hasNonNull("id") ? s.get("id").asText() : "?";
                    sb.append("- [ID: ").append(sId).append("] ").append(s.hasNonNull("specGroup") ? s.get("specGroup").asText() : "").append(": ")
                      .append(s.hasNonNull("specKey") ? s.get("specKey").asText() : "").append(" = ")
                      .append(s.hasNonNull("specValue") ? s.get("specValue").asText() : "").append("\n");
                }
            }
            
            JsonNode images = productClient.getProductImages(id);
            if (images != null && images.isArray() && images.size() > 0) {
                sb.append("\n📸 **Thư viện Ảnh / Video:**\n");
                for (JsonNode img : images) {
                    String imgId = img.hasNonNull("id") ? img.get("id").asText() : "?";
                    String mType = img.hasNonNull("mediaType") ? img.get("mediaType").asText() : "IMAGE";
                    boolean isPrimary = img.hasNonNull("primaryImage") && img.get("primaryImage").asBoolean();
                    sb.append("- [ID: ").append(imgId).append("] ").append(mType);
                    if (isPrimary) sb.append(" (⭐ Ảnh Mặc định)");
                    sb.append("\n");
                }
            } else {
                sb.append("\n⚠️ **CẢNH BÁO: Sản phẩm này chưa có hình ảnh/video nào! Khách hàng sẽ không thể xem.**\n");
            }
            
            InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
            List<List<InlineKeyboardButton>> rows = new ArrayList<>();
            
            List<InlineKeyboardButton> row1 = new ArrayList<>();
            InlineKeyboardButton btnName = new InlineKeyboardButton();
            btnName.setText("✏ Sửa Tên");
            btnName.setCallbackData("EDIT_NAME_" + id);
            row1.add(btnName);
            
            InlineKeyboardButton btnPrice = new InlineKeyboardButton();
            btnPrice.setText("✏ Sửa Giá");
            btnPrice.setCallbackData("EDIT_PRICE_" + id);
            row1.add(btnPrice);
            
            InlineKeyboardButton btnQuantity = new InlineKeyboardButton();
            btnQuantity.setText("✏ Sửa Số lượng");
            btnQuantity.setCallbackData("EDIT_QUANTITY_" + id);
            row1.add(btnQuantity);
            
            rows.add(row1);
            
            List<InlineKeyboardButton> row2 = new ArrayList<>();
            InlineKeyboardButton btnVariant = new InlineKeyboardButton();
            btnVariant.setText("➕ Thêm Biến thể");
            btnVariant.setCallbackData("ADD_VARIANT_" + id);
            row2.add(btnVariant);
            
            InlineKeyboardButton btnSpec = new InlineKeyboardButton();
            btnSpec.setText("➕ Thêm Thông số");
            btnSpec.setCallbackData("ADD_SPEC_" + id);
            row2.add(btnSpec);
            rows.add(row2);
            
            List<InlineKeyboardButton> row3 = new ArrayList<>();
            InlineKeyboardButton btnMedia = new InlineKeyboardButton();
            btnMedia.setText("📸 Upload Ảnh/Video");
            btnMedia.setCallbackData("UPLOAD_MEDIA_" + id);
            row3.add(btnMedia);
            
            InlineKeyboardButton btnSetPrimary = new InlineKeyboardButton();
            btnSetPrimary.setText("⭐ Đặt Ảnh Mặc định");
            btnSetPrimary.setCallbackData("SET_PRIMARY_" + id);
            row3.add(btnSetPrimary);
            rows.add(row3);
            
            List<InlineKeyboardButton> rowMedia = new ArrayList<>();
            InlineKeyboardButton btnViewMedia = new InlineKeyboardButton();
            btnViewMedia.setText("🖼 Xem Ảnh / Video");
            btnViewMedia.setCallbackData("VIEW_MEDIA_" + id);
            rowMedia.add(btnViewMedia);
            rows.add(rowMedia);
            
            List<InlineKeyboardButton> row4 = new ArrayList<>();
            InlineKeyboardButton btnDeleteVarSpec = new InlineKeyboardButton();
            btnDeleteVarSpec.setText("🗑 Xóa Biến thể/Thông số");
            btnDeleteVarSpec.setCallbackData("DELETE_VAR_SPEC_" + id);
            row4.add(btnDeleteVarSpec);
            
            InlineKeyboardButton btnDeleteProd = new InlineKeyboardButton();
            btnDeleteProd.setText("🗑 Xóa SP");
            btnDeleteProd.setCallbackData("DELETE_PROD_" + id);
            row4.add(btnDeleteProd);
            rows.add(row4);

            markup.setKeyboard(rows);
            
            SendMessage message = new SendMessage();
            message.setChatId(chatId.toString());
            message.setText(sb.toString());
            message.setReplyMarkup(markup);
            bot.execute(message);
        } catch (Exception e) {
            e.printStackTrace();
            bot.sendMessage(chatId, "Lỗi khi lấy chi tiết sản phẩm: " + e.getMessage());
        }
    }
    
    private void updateProductField(Long chatId, Long id, String field, Object value, AdminTelegramBot bot, String username, String userId) {
        try {
            JsonNode existing = productClient.getProductById(id);
            if (existing == null) {
                bot.sendMessage(chatId, "Không tìm thấy sản phẩm.");
                return;
            }
            
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode updateRequest = mapper.createObjectNode();
            
            // We must copy existing fields since it's a PUT request
            updateRequest.put("productName", existing.hasNonNull("productName") ? existing.get("productName").asText() : "N/A");
            updateRequest.put("discription", existing.hasNonNull("discription") ? existing.get("discription").asText() : "");
            
            double currentPrice = existing.hasNonNull("price") ? existing.get("price").asDouble() : 0.01;
            if (currentPrice < 0.01) currentPrice = 0.01; // Enforce minimum 0.01 to prevent 400 Bad Request
            updateRequest.put("price", currentPrice);
            
            updateRequest.put("availability", existing.hasNonNull("availability") ? existing.get("availability").asInt() : 0);
            updateRequest.put("sku", existing.hasNonNull("sku") ? existing.get("sku").asText() : null);
            
            if (existing.hasNonNull("brandId")) {
                updateRequest.put("brandId", existing.get("brandId").asLong());
            }
            if (existing.hasNonNull("categoryIds") && existing.get("categoryIds").isArray() && existing.get("categoryIds").size() > 0) {
                updateRequest.set("categoryIds", existing.get("categoryIds"));
            } else if (existing.hasNonNull("categoryId")) {
                updateRequest.put("categoryId", existing.get("categoryId").asLong());
            }

            // Update the specific field
            if (value instanceof String) {
                updateRequest.put(field, (String) value);
            } else if (value instanceof Double) {
                updateRequest.put(field, (Double) value);
            } else if (value instanceof Integer) {
                updateRequest.put(field, (Integer) value);
            }

            productClient.updateProduct(id, updateRequest, username, userId);
            bot.sendMessage(chatId, "✅ Cập nhật thành công!");
            sendProductDetails(chatId, id, bot);
        } catch (Exception e) {
            e.printStackTrace();
            bot.sendMessage(chatId, "Lỗi khi cập nhật sản phẩm: " + e.getMessage());
        }
    }
}
