package com.rainbowforest.telegramservice.bot;

import com.rainbowforest.telegramservice.client.OrderClient;
import com.rainbowforest.telegramservice.client.ProductClient;
import com.rainbowforest.telegramservice.entity.TelegramToken;
import com.rainbowforest.telegramservice.entity.TelegramUser;
import com.rainbowforest.telegramservice.repository.TelegramTokenRepository;
import com.rainbowforest.telegramservice.repository.TelegramUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.ByteArrayResource;
import org.telegram.telegrambots.meta.api.objects.Document;
import org.telegram.telegrambots.meta.api.methods.GetFile;
import org.telegram.telegrambots.meta.api.methods.send.SendDocument;
import org.telegram.telegrambots.meta.api.objects.InputFile;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.CallbackQuery;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText;
import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import java.util.Optional;

import org.telegram.telegrambots.meta.api.methods.commands.SetMyCommands;
import org.telegram.telegrambots.meta.api.objects.commands.BotCommand;
import org.telegram.telegrambots.meta.api.objects.commands.scope.BotCommandScopeDefault;
import javax.annotation.PostConstruct;

@Component
public class AdminTelegramBot extends TelegramLongPollingBot {

    @Value("${telegram.bot.username}")
    private String botUsername;

    @Value("${telegram.bot.token}")
    private String botToken;

    @Autowired
    private TelegramUserRepository userRepository;

    @Autowired
    private TelegramTokenRepository tokenRepository;

    @Autowired
    private ProductClient productClient;

    @Autowired
    private OrderClient orderClient;

    @Autowired
    private DiscoveryClient discoveryClient;

    @Autowired
    private ProductEditBotHandler productEditBotHandler;

    private Map<Long, JsonNode> pendingImports = new ConcurrentHashMap<>();
    private Map<Long, UserSession> userSessions = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        List<BotCommand> listOfCommands = new ArrayList<>();
        listOfCommands.add(new BotCommand("/products", "Xem danh sách sản phẩm mới nhất"));
        listOfCommands.add(new BotCommand("/orders", "Xem danh sách đơn hàng mới nhất"));
        listOfCommands.add(new BotCommand("/stock", "Quản lý kho hàng"));
        
        try {
            this.execute(new SetMyCommands(listOfCommands, new BotCommandScopeDefault(), null));
        } catch (TelegramApiException e) {
            e.printStackTrace();
        }
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public String getBotToken() {
        return botToken;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasCallbackQuery()) {
            handleCallbackQuery(update.getCallbackQuery());
            return;
        }

        if (update.hasMessage() && update.getMessage().hasDocument()) {
            handleDocument(update.getMessage().getChatId(), update.getMessage().getDocument(), update.getMessage().getFrom().getUserName());
            return;
        }

        if (update.hasMessage() && update.getMessage().hasPhoto()) {
            Long chatId = update.getMessage().getChatId();
            UserSession session = userSessions.computeIfAbsent(chatId, k -> new UserSession());
            if (session.getState() == BotState.WAITING_FOR_PRODUCT_MEDIA) {
                handlePhotoUpload(chatId, update.getMessage().getPhoto(), session, update.getMessage().getFrom().getUserName());
                return;
            }
            return;
        }

        if (update.hasMessage() && update.getMessage().hasVideo()) {
            Long chatId = update.getMessage().getChatId();
            UserSession session = userSessions.computeIfAbsent(chatId, k -> new UserSession());
            if (session.getState() == BotState.WAITING_FOR_PRODUCT_MEDIA) {
                handleVideoUpload(chatId, update.getMessage().getVideo(), session, update.getMessage().getFrom().getUserName());
                return;
            }
            return;
        }

        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageText = update.getMessage().getText();
            Long chatId = update.getMessage().getChatId();
            String username = update.getMessage().getFrom().getUserName();

            if (messageText.startsWith("/login")) {
                handleLogin(chatId, username, messageText);
                return;
            }

            // Check authentication
            Optional<TelegramUser> userOpt = userRepository.findByChatId(chatId);
            if (!userOpt.isPresent()) {
                sendMessage(chatId, "Bạn chưa đăng nhập. Vui lòng sử dụng lệnh /login <token> để xác thực.");
                return;
            }

            TelegramUser user = userOpt.get();
            UserSession session = userSessions.computeIfAbsent(chatId, k -> new UserSession());

            // Check if state is waiting for input
            if (session.getState() != BotState.NONE && !messageText.startsWith("/")) {
                productEditBotHandler.handleText(chatId, messageText, session, this, user.getUsername(), user.getSystemUserId() != null ? user.getSystemUserId().toString() : null);
                return;
            }

            // Handle authenticated commands
            if (messageText.startsWith("/products") || messageText.startsWith("/product") || messageText.startsWith("/search")) {
                if (messageText.equals("/products")) {
                    productEditBotHandler.sendProductPage(chatId, 0, this);
                } else {
                    productEditBotHandler.handleText(chatId, messageText, session, this, user.getUsername(), user.getSystemUserId() != null ? user.getSystemUserId().toString() : null);
                }
                return;
            }

            if (messageText.startsWith("/products")) {
                try {
                    JsonNode productsNode = productClient.getProducts(0, 5, null);
                    StringBuilder sb = new StringBuilder("🛍 **Danh sách Sản phẩm mới nhất:**\n\n");
                    if (productsNode != null && productsNode.has("content")) {
                        for (JsonNode item : productsNode.get("content")) {
                            sb.append("- ").append(item.has("productName") ? item.get("productName").asText() : "N/A")
                              .append(" (").append(item.has("price") ? item.get("price").asText() + "đ" : "N/A").append(")\n");
                        }
                    } else {
                        sb.append("Không có sản phẩm nào.");
                    }
                    sendMessage(chatId, sb.toString());
                } catch (Exception e) {
                    sendMessage(chatId, "Lỗi khi lấy danh sách sản phẩm.");
                }
            } else if (messageText.startsWith("/orders")) {
                try {
                    JsonNode ordersNode = orderClient.getOrders(0, 5);
                    StringBuilder sb = new StringBuilder("📦 **Danh sách Đơn hàng mới nhất:**\n\n");
                    if (ordersNode != null && ordersNode.has("items")) {
                        for (JsonNode item : ordersNode.get("items")) {
                            sb.append("- Đơn ").append(item.has("orderNumber") ? item.get("orderNumber").asText() : "N/A")
                              .append(" (").append(item.has("status") ? item.get("status").asText() : "N/A").append(")\n");
                        }
                    } else {
                        sb.append("Không có đơn hàng nào.");
                    }
                    sendMessage(chatId, sb.toString());
                } catch (Exception e) {
                    sendMessage(chatId, "Lỗi khi lấy danh sách đơn hàng.");
                }
            } else if (messageText.startsWith("/stock")) {
                sendMessage(chatId, "Tính năng cập nhật kho đang được phát triển.");
            } else {
                sendMessage(chatId, "Lệnh không hợp lệ. Các lệnh hỗ trợ: /products, /orders, /stock");
            }
        }
    }

    private void handleLogin(Long chatId, String username, String messageText) {
        String[] parts = messageText.split(" ");
        if (parts.length < 2) {
            sendMessage(chatId, "Vui lòng nhập token. Ví dụ: /login 12345678");
            return;
        }

        String tokenString = parts[1];
        Optional<TelegramToken> tokenOpt = tokenRepository.findByToken(tokenString);

        if (!tokenOpt.isPresent() || tokenOpt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
            sendMessage(chatId, "Token không hợp lệ hoặc đã hết hạn.");
            return;
        }

        TelegramToken token = tokenOpt.get();

        // Check if user already exists
        Optional<TelegramUser> existingUser = userRepository.findBySystemUserId(token.getSystemUserId());
        TelegramUser telegramUser = existingUser.orElse(new TelegramUser());
        
        telegramUser.setChatId(chatId);
        telegramUser.setUsername(username != null ? username : "Unknown");
        telegramUser.setSystemUserId(token.getSystemUserId());
        telegramUser.setRole(token.getRole());
        telegramUser.setLinkedAt(LocalDateTime.now());

        userRepository.save(telegramUser);
        
        // Delete token after successful use
        tokenRepository.delete(token);

        sendMessage(chatId, "Xác thực thành công! Bạn đã có quyền " + token.getRole() + " trên The Kinetic Vault Bot.");
    }

    public void sendMessage(Long chatId, String text) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId.toString());
        message.setText(text);
        try {
            execute(message);
        } catch (TelegramApiException e) {
            e.printStackTrace();
        }
    }

    public void sendMediaList(Long chatId, com.fasterxml.jackson.databind.JsonNode images) {
        if (images == null || !images.isArray() || images.size() == 0) return;
        
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            int count = 0;
            for (com.fasterxml.jackson.databind.JsonNode img : images) {
                if (count >= 5) break; // Limit to 5 images to avoid spam/timeout
                try {
                    String storagePath = img.get("storagePath").asText();
                    String type = img.hasNonNull("mediaType") ? img.get("mediaType").asText() : "IMAGE";
                    String url = getProductCatalogUrl() + "/admin/products/images/file/" + storagePath;
                    
                    byte[] fileBytes = restTemplate.getForObject(url, byte[].class);
                    java.io.InputStream is = new java.io.ByteArrayInputStream(fileBytes);
                    org.telegram.telegrambots.meta.api.objects.InputFile inputFile = new org.telegram.telegrambots.meta.api.objects.InputFile(is, storagePath);
                    
                    if ("VIDEO".equalsIgnoreCase(type)) {
                        org.telegram.telegrambots.meta.api.methods.send.SendVideo sendVideo = new org.telegram.telegrambots.meta.api.methods.send.SendVideo();
                        sendVideo.setChatId(chatId.toString());
                        sendVideo.setVideo(inputFile);
                        execute(sendVideo);
                    } else {
                        org.telegram.telegrambots.meta.api.methods.send.SendPhoto sendPhoto = new org.telegram.telegrambots.meta.api.methods.send.SendPhoto();
                        sendPhoto.setChatId(chatId.toString());
                        sendPhoto.setPhoto(inputFile);
                        execute(sendPhoto);
                    }
                    count++;
                } catch (Exception e) {
                    System.err.println("Could not send media: " + e.getMessage());
                }
            }
        });
    }

    private String getProductCatalogUrl() {
        List<ServiceInstance> instances = discoveryClient.getInstances("product-catalog-service");
        if (instances != null && !instances.isEmpty()) {
            return instances.get(0).getUri().toString();
        }
        return "http://localhost:8810";
    }

    private void handlePhotoUpload(Long chatId, List<org.telegram.telegrambots.meta.api.objects.PhotoSize> photos, UserSession session, String username) {
        try {
            // Get the highest resolution photo
            org.telegram.telegrambots.meta.api.objects.PhotoSize photo = photos.stream()
                    .max(java.util.Comparator.comparing(org.telegram.telegrambots.meta.api.objects.PhotoSize::getFileSize))
                    .orElse(null);
            if (photo == null) return;
            
            GetFile getFile = new GetFile();
            getFile.setFileId(photo.getFileId());
            org.telegram.telegrambots.meta.api.objects.File file = execute(getFile);
            
            String fileUrl = "https://api.telegram.org/file/bot" + getBotToken() + "/" + file.getFilePath();
            
            Long targetProductId = session.getTargetProductId();
            sendMessage(chatId, "⏳ Đang tải ảnh lên hệ thống ngầm, vui lòng đợi...");
            session.setState(BotState.NONE);
            session.setTargetProductId(null);
            
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                uploadMediaToCatalog(chatId, fileUrl, file.getFilePath(), targetProductId, username, ".jpg");
            });
        } catch (Exception e) {
            e.printStackTrace();
            sendMessage(chatId, "Lỗi khi xử lý ảnh: " + e.getMessage());
        }
    }

    private void handleVideoUpload(Long chatId, org.telegram.telegrambots.meta.api.objects.Video video, UserSession session, String username) {
        try {
            GetFile getFile = new GetFile();
            getFile.setFileId(video.getFileId());
            org.telegram.telegrambots.meta.api.objects.File file = execute(getFile);
            
            String fileUrl = "https://api.telegram.org/file/bot" + getBotToken() + "/" + file.getFilePath();
            
            Long targetProductId = session.getTargetProductId();
            sendMessage(chatId, "⏳ Đang tải video lên hệ thống ngầm, vui lòng đợi...");
            session.setState(BotState.NONE);
            session.setTargetProductId(null);
            
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                uploadMediaToCatalog(chatId, fileUrl, file.getFilePath(), targetProductId, username, ".mp4");
            });
        } catch (Exception e) {
            e.printStackTrace();
            sendMessage(chatId, "Lỗi khi xử lý video: " + e.getMessage());
        }
    }

    private void uploadMediaToCatalog(Long chatId, String fileUrl, String filePath, Long productId, String username, String defaultExt) {
        try {
            
            // Download file
            RestTemplate restTemplate = new RestTemplate();
            byte[] fileBytes = restTemplate.getForObject(fileUrl, byte[].class);
            
            // Prepare multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("X-Username", username);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            String filename = filePath.substring(filePath.lastIndexOf('/') + 1);
            if (!filename.contains(".")) {
                filename += defaultExt;
            }
            final String finalFilename = filename;
            
            ByteArrayResource resource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return finalFilename;
                }
            };
            
            body.add("files", resource);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String url = getProductCatalogUrl() + "/admin/products/" + productId + "/images/upload";
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                sendMessage(chatId, "✅ Đã tải file lên hệ thống thành công!");
            } else {
                sendMessage(chatId, "Upload thất bại: " + response.getStatusCode());
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendMessage(chatId, "Lỗi khi tải file lên hệ thống: " + e.getMessage());
        }
    }

    private void handleDocument(Long chatId, Document document, String username) {
        Optional<TelegramUser> userOpt = userRepository.findByChatId(chatId);
        if (!userOpt.isPresent()) {
            sendMessage(chatId, "Bạn chưa đăng nhập. Vui lòng sử dụng lệnh /login <token> để xác thực.");
            return;
        }
        
        String fileName = document.getFileName();
        if (fileName == null || (!fileName.endsWith(".xls") && !fileName.endsWith(".xlsx"))) {
            return; // Ignore non-excel
        }

        sendMessage(chatId, "Đang xử lý file Excel...");

        GetFile getFileMethod = new GetFile();
        getFileMethod.setFileId(document.getFileId());
        try {
            org.telegram.telegrambots.meta.api.objects.File file = execute(getFileMethod);
            String fileUrl = file.getFileUrl(getBotToken());
            
            RestTemplate restTemplate = new RestTemplate();
            byte[] excelBytes = restTemplate.getForObject(fileUrl, byte[].class);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(excelBytes) {
                @Override
                public String getFilename() {
                    return fileName;
                }
            });
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(getProductCatalogUrl() + "/admin/products/excel/preview", requestEntity, JsonNode.class);
            
            JsonNode previewRows = response.getBody();
            int valid = 0, invalid = 0;
            if (previewRows != null && previewRows.isArray()) {
                for (JsonNode row : previewRows) {
                    if (row.has("valid") && row.get("valid").asBoolean()) {
                        valid++;
                    } else {
                        invalid++;
                    }
                }
            }
            
            pendingImports.put(chatId, previewRows);
            
            String text = "Đã phân tích file Excel:\n" +
                          "✅ Hợp lệ: " + valid + " dòng\n" +
                          "❌ Không hợp lệ: " + invalid + " dòng\n";
                          
            if (invalid > 0) {
                text += "\nĐang xuất file chi tiết lỗi...";
                sendMessage(chatId, text);
                
                byte[] errorExcel = productClient.generateErrorExcel(previewRows);
                SendDocument sendDocument = new SendDocument();
                sendDocument.setChatId(chatId.toString());
                sendDocument.setDocument(new InputFile(new ByteArrayInputStream(errorExcel), "Error_" + fileName));
                execute(sendDocument);
            } else {
                sendMessage(chatId, text);
            }
            
            if (valid > 0) {
                SendMessage msg = new SendMessage();
                msg.setChatId(chatId.toString());
                msg.setText("Bạn có muốn tiếp tục import " + valid + " dòng hợp lệ không?");
                
                InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
                List<List<InlineKeyboardButton>> rows = new ArrayList<>();
                List<InlineKeyboardButton> row = new ArrayList<>();
                
                InlineKeyboardButton btnConfirm = new InlineKeyboardButton();
                btnConfirm.setText("✅ Xác nhận Import");
                btnConfirm.setCallbackData("CONFIRM_IMPORT");
                row.add(btnConfirm);
                
                InlineKeyboardButton btnCancel = new InlineKeyboardButton();
                btnCancel.setText("❌ Hủy");
                btnCancel.setCallbackData("CANCEL_IMPORT");
                row.add(btnCancel);
                
                rows.add(row);
                markup.setKeyboard(rows);
                msg.setReplyMarkup(markup);
                
                execute(msg);
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendMessage(chatId, "Lỗi khi xử lý file: " + e.getMessage());
        }
    }

    private void handleCallbackQuery(CallbackQuery callbackQuery) {
        String data = callbackQuery.getData();
        Long chatId = callbackQuery.getMessage().getChatId();
        
        Optional<TelegramUser> userOpt = userRepository.findByChatId(chatId);
        if (!userOpt.isPresent()) {
            sendMessage(chatId, "Bạn chưa xác thực.");
            return;
        }

        UserSession session = userSessions.computeIfAbsent(chatId, k -> new UserSession());

        if (data.startsWith("VIEW_PROD_") || data.startsWith("EDIT_NAME_") || data.startsWith("EDIT_PRICE_") || data.startsWith("PAGE_")
            || data.startsWith("ADD_VARIANT_") || data.startsWith("ADD_SPEC_") || data.startsWith("UPLOAD_MEDIA_")
            || data.startsWith("SET_PRIMARY_") || data.startsWith("DELETE_VAR_SPEC_") || data.startsWith("DELETE_PROD_")
            || data.startsWith("VIEW_MEDIA_")) {
            productEditBotHandler.handleCallback(callbackQuery, session, this);
            return;
        }

        if ("CANCEL_IMPORT".equals(data)) {
            pendingImports.remove(chatId);
            sendMessage(chatId, "Đã hủy import.");
        } else if ("CONFIRM_IMPORT".equals(data)) {
            JsonNode rows = pendingImports.get(chatId);
            if (rows == null) {
                sendMessage(chatId, "Không có dữ liệu import nào đang chờ xác nhận (hoặc đã hết hạn).");
                return;
            }
            
            sendMessage(chatId, "Đang tiến hành import...");
            try {
                TelegramUser user = userOpt.get();
                Map<String, Object> result = productClient.confirmImport(rows, user.getUsername(), user.getSystemUserId() != null ? user.getSystemUserId().toString() : null);
                pendingImports.remove(chatId);
                
                sendMessage(chatId, "✅ Đã lưu thành công " + result.get("successCount") + " dòng dữ liệu (biến thể) hợp lệ vào hệ thống!");
            } catch (Exception e) {
                e.printStackTrace();
                sendMessage(chatId, "Lỗi khi import: " + e.getMessage());
            }
        } else if (data.startsWith("CONFIRM_ORDER_")) {
            Long orderId = Long.parseLong(data.substring("CONFIRM_ORDER_".length()));
            try {
                TelegramUser user = userOpt.get();
                Map<String, Object> req = new java.util.HashMap<>();
                req.put("status", "CONFIRMED");
                req.put("performedBy", user.getUsername());
                
                orderClient.updateOrderStatus(orderId, req);

                EditMessageText editMsg = new EditMessageText();
                editMsg.setChatId(chatId.toString());
                editMsg.setMessageId(callbackQuery.getMessage().getMessageId());
                editMsg.setText(callbackQuery.getMessage().getText() + "\n\n✅ **Đã xác nhận bởi @" + user.getUsername() + "**");
                execute(editMsg);
            } catch (Exception e) {
                e.printStackTrace();
                sendMessage(chatId, "Lỗi khi xác nhận đơn hàng: " + e.getMessage());
            }
        }
    }
}
