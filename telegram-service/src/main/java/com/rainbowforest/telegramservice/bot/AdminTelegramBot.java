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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.annotation.PostConstruct;

@Component
public class AdminTelegramBot extends TelegramLongPollingBot {
    private static final Logger log = LoggerFactory.getLogger(AdminTelegramBot.class);

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
        listOfCommands.add(new BotCommand("/start", "Bắt đầu & hướng dẫn sử dụng"));
        listOfCommands.add(new BotCommand("/products", "Danh sách & chỉnh sửa sản phẩm"));
        listOfCommands.add(new BotCommand("/orders", "Danh sách đơn hàng mới nhất"));
        listOfCommands.add(new BotCommand("/order", "Chi tiết đơn hàng (/order <id>)"));
        listOfCommands.add(new BotCommand("/stock", "Kiểm tra tồn kho & cảnh báo"));
        listOfCommands.add(new BotCommand("/help", "Trợ giúp các lệnh quản trị"));
        
        try {
            this.execute(new SetMyCommands(listOfCommands, new BotCommandScopeDefault(), null));
        } catch (TelegramApiException e) {
            log.error("Lỗi khi đăng ký bot commands Telegram: ", e);
        }

        // Cleanup session/pending state định kỳ (tránh memory leak khi nhiều admin dùng bot).
        scheduledExecutor.scheduleAtFixedRate(() -> {
            try {
                cleanupExpiredSessions();
            } catch (Exception ignored) {
                // Không làm scheduler crash
            }
        }, 5, 5, java.util.concurrent.TimeUnit.MINUTES);
    }

    private final java.util.concurrent.ScheduledExecutorService scheduledExecutor =
            java.util.concurrent.Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "telegram-bot-cleanup");
                t.setDaemon(true);
                return t;
            });

    /**
     * Xoá các session quá hạn (mặc định 30 phút) để tránh memory leak.
     */
    private void cleanupExpiredSessions() {
        long now = System.currentTimeMillis();
        long SESSION_TTL_MS = 30L * 60 * 1000;
        int before = userSessions.size();
        userSessions.entrySet().removeIf(e -> {
            UserSession s = e.getValue();
            return s == null || s.getLastAccessedAt() == 0 || (now - s.getLastAccessedAt()) > SESSION_TTL_MS;
        });
        if (userSessions.size() < before) {
            log.info("Cleaned up telegram sessions: removed={}, remaining={}", before - userSessions.size(), userSessions.size());
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
                if (messageText.startsWith("/start") || messageText.startsWith("/help")) {
                    sendMessage(chatId, "👋 **Chào mừng bạn đến với The Kinetic Vault Admin Bot!**\n\n" +
                            "Để sử dụng bot, bạn cần liên kết tài khoản Quản trị viên:\n" +
                            "1. Đăng nhập vào trang Quản trị (Admin Dashboard).\n" +
                            "2. Vào mục **Cài đặt / Tài khoản** để lấy mã Token liên kết Telegram.\n" +
                            "3. Nhập lệnh: `/login <mã_token>`\n\n" +
                            "Ví dụ: `/login 98765432`");
                    return;
                }
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
            if (messageText.startsWith("/start") || messageText.startsWith("/help")) {
                handleHelp(chatId, user);
                return;
            }

            if (messageText.startsWith("/products") || messageText.startsWith("/product") || messageText.startsWith("/search")) {
                if (messageText.equals("/products")) {
                    productEditBotHandler.sendProductPage(chatId, 0, this);
                } else {
                    productEditBotHandler.handleText(chatId, messageText, session, this, user.getUsername(), user.getSystemUserId() != null ? user.getSystemUserId().toString() : null);
                }
                return;
            }

            if (messageText.startsWith("/orders")) {
                handleOrdersList(chatId);
            } else if (messageText.startsWith("/order")) {
                String param = messageText.length() > 6 ? messageText.substring(6).trim() : "";
                handleOrderDetail(chatId, param, user);
            } else if (messageText.startsWith("/stock")) {
                handleStockCheck(chatId);
            } else {
                sendMessage(chatId, "Lệnh không hợp lệ. Các lệnh hỗ trợ: /products, /orders, /order <id>, /stock, /help");
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
            log.error("Lỗi khi gửi message Telegram: ", e);
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
                    log.error("Could not send media: {}", e.getMessage());
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
            log.error("Lỗi khi xử lý ảnh Telegram photo upload: ", e);
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
            log.error("Lỗi khi xử lý video Telegram video upload: ", e);
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
            log.error("Lỗi khi tải file media lên product-catalog-service: ", e);
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
            log.error("Lỗi khi xử lý document Excel trong Telegram bot: ", e);
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
                log.error("Lỗi khi confirm import Excel trong Telegram bot: ", e);
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
                editMsg.setReplyMarkup(null);
                execute(editMsg);
            } catch (Exception e) {
                log.error("Lỗi khi xác nhận đơn hàng qua Telegram bot: ", e);
                sendMessage(chatId, "Lỗi khi xác nhận đơn hàng: " + e.getMessage());
            }
        }
    }

    private void handleHelp(Long chatId, TelegramUser user) {
        String msg = "👋 **Xin chào @" + (user != null ? user.getUsername() : "Admin") + "!**\n" +
                "Chào mừng bạn đến với **The Kinetic Vault Admin Bot**.\n\n" +
                "📌 **Các lệnh quản trị hỗ trợ:**\n" +
                "• `/products` - Danh sách sản phẩm, phân trang & chỉnh sửa biến thể đa tầng\n" +
                "• `/search <từ_khóa>` - Tìm nhanh sản phẩm theo tên\n" +
                "• `/orders` - Xem 5 đơn hàng mới nhất kèm chi tiết biến thể & MVD\n" +
                "• `/order <ID>` - Tra cứu chi tiết 1 đơn hàng & duyệt đơn 1 chạm\n" +
                "• `/stock` - Quét và cảnh báo tồn kho các sản phẩm sắp hết\n" +
                "• `/help` - Xem lại danh sách lệnh trợ giúp này\n\n" +
                "📁 **Import Excel:** Bạn có thể kéo thả hoặc gửi file `.xlsx` / `.xls` vào đoạn chat này để import hàng loạt sản phẩm và biến thể!";
        sendMessage(chatId, msg);
    }

    private void handleOrdersList(Long chatId) {
        try {
            JsonNode ordersNode = orderClient.getOrders(0, 5);
            StringBuilder sb = new StringBuilder("📦 **DANH SÁCH 5 ĐƠN HÀNG MỚI NHẤT**\n\n");
            if (ordersNode != null && ordersNode.has("items") && ordersNode.get("items").isArray() && ordersNode.get("items").size() > 0) {
                for (JsonNode item : ordersNode.get("items")) {
                    Long orderId = item.hasNonNull("id") ? item.get("id").asLong() : null;
                    String orderNum = item.hasNonNull("orderNumber") ? item.get("orderNumber").asText() : (orderId != null ? String.valueOf(orderId) : "N/A");
                    String status = item.hasNonNull("status") ? item.get("status").asText() : "N/A";
                    double total = item.hasNonNull("totalPrice") ? item.get("totalPrice").asDouble() : 0.0;
                    String mvd = item.hasNonNull("trackingNumber") ? item.get("trackingNumber").asText() : null;
                    
                    String statusIcon = "🕒";
                    if ("CONFIRMED".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status) || "DELIVERED".equalsIgnoreCase(status)) {
                        statusIcon = "✅";
                    } else if ("SHIPPING".equalsIgnoreCase(status) || "DELIVERING".equalsIgnoreCase(status)) {
                        statusIcon = "🚚";
                    } else if ("CANCELLED".equalsIgnoreCase(status)) {
                        statusIcon = "❌";
                    }

                    sb.append(statusIcon).append(" **Đơn #").append(orderNum).append("** (ID: `").append(orderId != null ? orderId : "N/A").append("`)\n")
                      .append("  • Trạng thái: `").append(status).append("`\n")
                      .append("  • Tổng tiền: **").append(String.format("%,.0fđ", total)).append("**\n");

                    if (mvd != null && !mvd.isEmpty()) {
                        sb.append("  • Mã vận đơn: `").append(mvd).append("`\n");
                    }

                    if (item.has("items") && item.get("items").isArray() && item.get("items").size() > 0) {
                        sb.append("  • Món hàng:\n");
                        for (JsonNode it : item.get("items")) {
                            String pName = it.hasNonNull("productName") ? it.get("productName").asText() : "Sản phẩm";
                            int qty = it.hasNonNull("quantity") ? it.get("quantity").asInt() : 1;
                            String vName = it.hasNonNull("variantName") ? it.get("variantName").asText() : null;
                            String vLabel = it.hasNonNull("variantLabel") ? it.get("variantLabel").asText() : null;
                            String cleanVar = formatCleanVariant(vName, vLabel);
                            
                            sb.append("    - ").append(pName);
                            if (!cleanVar.isEmpty()) {
                                sb.append(" [").append(cleanVar).append("]");
                            }
                            sb.append(" × ").append(qty).append("\n");
                        }
                    }
                    sb.append("  👉 Xem chi tiết: `/order ").append(orderId != null ? orderId : orderNum).append("`\n\n");
                }
            } else {
                sb.append("Hiện chưa có đơn hàng nào trong hệ thống.");
            }
            sendMessage(chatId, sb.toString());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách đơn hàng Telegram: ", e);
            sendMessage(chatId, "Lỗi khi lấy danh sách đơn hàng: " + e.getMessage());
        }
    }

    private void handleOrderDetail(Long chatId, String orderParam, TelegramUser user) {
        if (orderParam == null || orderParam.isEmpty()) {
            sendMessage(chatId, "Vui lòng nhập ID đơn hàng. Ví dụ: `/order 1`");
            return;
        }
        orderParam = orderParam.replace("#", "").trim();
        try {
            Long orderId = Long.parseLong(orderParam);
            JsonNode order = orderClient.getOrderById(orderId);
            if (order == null || order.isNull()) {
                sendMessage(chatId, "Không tìm thấy đơn hàng với ID: " + orderId);
                return;
            }

            String orderNum = order.hasNonNull("orderNumber") ? order.get("orderNumber").asText() : String.valueOf(orderId);
            String status = order.hasNonNull("status") ? order.get("status").asText() : "N/A";
            double total = order.hasNonNull("totalPrice") ? order.get("totalPrice").asDouble() : 0.0;
            String customer = order.hasNonNull("customerName") ? order.get("customerName").asText() : (order.hasNonNull("recipientName") ? order.get("recipientName").asText() : "Khách hàng");
            String phone = order.hasNonNull("phone") ? order.get("phone").asText() : (order.hasNonNull("phoneNumber") ? order.get("phoneNumber").asText() : "N/A");
            String address = order.hasNonNull("shippingAddress") ? order.get("shippingAddress").asText() : "N/A";
            String mvd = order.hasNonNull("trackingNumber") ? order.get("trackingNumber").asText() : null;
            String paymentMethod = order.hasNonNull("paymentMethod") ? order.get("paymentMethod").asText() : "COD";

            StringBuilder sb = new StringBuilder();
            sb.append("🧾 **CHI TIẾT ĐƠN HÀNG #").append(orderNum).append("** (ID: `").append(orderId).append("`)\n\n");
            sb.append("👤 **Khách hàng:** ").append(customer).append("\n");
            sb.append("📞 **Số điện thoại:** `").append(phone).append("`\n");
            sb.append("📍 **Địa chỉ giao:** ").append(address).append("\n");
            sb.append("💳 **Phương thức:** ").append(paymentMethod).append("\n");
            sb.append("📊 **Trạng thái:** `").append(status).append("`\n");
            if (mvd != null && !mvd.isEmpty()) {
                sb.append("🚚 **Mã vận đơn (MVD):** `").append(mvd).append("`\n");
            }
            sb.append("\n📦 **Danh sách sản phẩm:**\n");

            if (order.has("items") && order.get("items").isArray()) {
                for (JsonNode it : order.get("items")) {
                    String pName = it.hasNonNull("productName") ? it.get("productName").asText() : "Sản phẩm";
                    int qty = it.hasNonNull("quantity") ? it.get("quantity").asInt() : 1;
                    double price = it.hasNonNull("price") ? it.get("price").asDouble() : 0.0;
                    String vName = it.hasNonNull("variantName") ? it.get("variantName").asText() : null;
                    String vLabel = it.hasNonNull("variantLabel") ? it.get("variantLabel").asText() : null;
                    String cleanVar = formatCleanVariant(vName, vLabel);

                    sb.append("  • ").append(pName);
                    if (!cleanVar.isEmpty()) {
                        sb.append(" [").append(cleanVar).append("]");
                    }
                    sb.append(" × ").append(qty)
                      .append(" (").append(String.format("%,.0fđ", price * qty)).append(")\n");
                }
            }

            sb.append("\n💰 **TỔNG CỘNG:** ").append(String.format("%,.0fđ", total));

            SendMessage msg = new SendMessage();
            msg.setChatId(chatId.toString());
            msg.setText(sb.toString());

            // If order can be confirmed
            if ("PENDING".equalsIgnoreCase(status) || "NEW".equalsIgnoreCase(status) || "WAITING".equalsIgnoreCase(status) || "UNPAID".equalsIgnoreCase(status)) {
                InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
                List<List<InlineKeyboardButton>> rows = new ArrayList<>();
                List<InlineKeyboardButton> row = new ArrayList<>();

                InlineKeyboardButton btnConfirm = new InlineKeyboardButton();
                btnConfirm.setText("✅ Duyệt đơn ngay");
                btnConfirm.setCallbackData("CONFIRM_ORDER_" + orderId);
                row.add(btnConfirm);

                rows.add(row);
                markup.setKeyboard(rows);
                msg.setReplyMarkup(markup);
            }

            execute(msg);
        } catch (NumberFormatException e) {
            sendMessage(chatId, "ID đơn hàng phải là số. Ví dụ: `/order 1`");
        } catch (Exception e) {
            log.error("Lỗi khi tra cứu đơn hàng qua Telegram bot: ", e);
            sendMessage(chatId, "Lỗi khi tra cứu đơn hàng: " + e.getMessage());
        }
    }

    private void handleStockCheck(Long chatId) {
        try {
            sendMessage(chatId, "⏳ Đang kiểm tra tình trạng tồn kho sản phẩm và biến thể...");
            JsonNode productsNode = productClient.getProducts(0, 15, null);
            if (productsNode == null || !productsNode.has("content") || !productsNode.get("content").isArray()) {
                sendMessage(chatId, "Không thể lấy thông tin sản phẩm từ kho.");
                return;
            }

            StringBuilder sbLowStock = new StringBuilder();
            int lowStockCount = 0;
            int totalVariants = 0;

            for (JsonNode p : productsNode.get("content")) {
                if (!p.hasNonNull("id")) continue;
                Long pId = p.get("id").asLong();
                String pName = p.hasNonNull("productName") ? p.get("productName").asText() : "Sản phẩm #" + pId;

                try {
                    JsonNode variants = productClient.getProductVariants(pId);
                    if (variants != null && variants.isArray()) {
                        for (JsonNode v : variants) {
                            totalVariants++;
                            int qty = v.hasNonNull("availability") ? v.get("availability").asInt() : 0;
                            if (qty <= 5) {
                                lowStockCount++;
                                String vName = v.hasNonNull("variantName") ? v.get("variantName").asText() : null;
                                String cleanVar = formatCleanVariant(vName, null);
                                sbLowStock.append("  ⚠️ ").append(pName);
                                if (!cleanVar.isEmpty()) {
                                    sbLowStock.append(" [").append(cleanVar).append("]");
                                }
                                sbLowStock.append(": Còn lại **").append(qty).append("** cái\n");
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }

            StringBuilder out = new StringBuilder("📊 **BÁO CÁO TỒN KHO HÀNG HÓA**\n\n");
            out.append("• Đã quét: ").append(productsNode.get("content").size()).append(" sản phẩm (").append(totalVariants).append(" biến thể)\n");
            if (lowStockCount > 0) {
                out.append("• Cảnh báo hàng sắp hết (<= 5 cái): **").append(lowStockCount).append("** biến thể\n\n");
                out.append("Chi tiết:\n").append(sbLowStock.toString());
                out.append("\n👉 Dùng `/products` để cập nhật thêm hàng vào kho.");
            } else {
                out.append("• Tình trạng: ✅ **Tất cả các mặt hàng đều có đủ số lượng tồn kho.**");
            }

            sendMessage(chatId, out.toString());
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra kho Telegram bot: ", e);
            sendMessage(chatId, "Lỗi khi kiểm tra kho: " + e.getMessage());
        }
    }

    private String formatCleanVariant(String variantName, String variantLabel) {
        String label = (variantName != null && !variantName.isEmpty()) ? variantName : variantLabel;
        if (label == null || label.isEmpty()) return "";
        label = label.trim();
        if (label.startsWith("[") && label.endsWith("]")) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                JsonNode arrayNode = mapper.readTree(label);
                if (arrayNode.isArray() && arrayNode.size() > 0) {
                    List<String> parts = new ArrayList<>();
                    for (JsonNode n : arrayNode) {
                        String name = n.hasNonNull("name") ? n.get("name").asText().trim() : "";
                        String val = n.hasNonNull("value") ? n.get("value").asText().trim() : "";
                        if (!name.isEmpty() && !val.isEmpty()) {
                            parts.add(name + ": " + val);
                        } else if (!val.isEmpty()) {
                            parts.add(val);
                        }
                    }
                    if (!parts.isEmpty()) {
                        return String.join(" - ", parts);
                    }
                }
            } catch (Exception ignored) {}
        }
        return label;
    }
}
