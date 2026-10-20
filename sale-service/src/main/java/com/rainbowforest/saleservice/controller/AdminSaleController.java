package com.rainbowforest.saleservice.controller;

import com.rainbowforest.saleservice.dto.SaleProgramRequest;
import com.rainbowforest.saleservice.dto.VoucherRequest;
import com.rainbowforest.saleservice.dto.VoucherUsageResponse;
import com.rainbowforest.saleservice.entity.PromoBanner;
import com.rainbowforest.saleservice.entity.SaleProgram;
import com.rainbowforest.saleservice.entity.Voucher;
import com.rainbowforest.saleservice.service.NotificationAsyncService;
import com.rainbowforest.saleservice.service.SaleServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/sales")
public class AdminSaleController {

    @Autowired
    private SaleServiceImpl saleService;

    @Autowired
    private NotificationAsyncService notificationAsyncService;

    @Autowired(required = false)
    private com.rainbowforest.saleservice.client.ActivityLogFeignClient activityLogFeignClient;

    @org.springframework.beans.factory.annotation.Value("${internal.service.secret:}")
    private String expectedInternalSecret;

    private void sendSaleActivityLog(String action, String resourceType, String resourceId, String method, String path, Object detailObj, String performedBy) {
        if (activityLogFeignClient == null) return;
        try {
            java.util.Map<String, Object> detail = new java.util.LinkedHashMap<>();
            detail.put("resourceType", resourceType);
            detail.put("after", detailObj);

            java.util.Map<String, Object> logReq = new java.util.LinkedHashMap<>();
            logReq.put("action", action);
            logReq.put("resourceType", resourceType);
            logReq.put("resourceId", resourceId);
            logReq.put("httpMethod", method);
            logReq.put("requestPath", path);
            logReq.put("performedBy", performedBy != null ? performedBy : "system");
            logReq.put("detailJson", new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(detail));
            activityLogFeignClient.log(logReq);
        } catch (Exception ignored) {}
    }

    // ---- Sale Programs ----

    private static java.nio.file.Path getRootUploadPath(String subDir) {
        java.nio.file.Path path = java.nio.file.Paths.get(System.getProperty("user.dir"));
        if (path.getFileName().toString().endsWith("-service")) {
            path = path.getParent();
        }
        return path.resolve("uploads").resolve(subDir);
    }
    private static final java.nio.file.Path BANNER_UPLOAD_DIR = getRootUploadPath("banner-images");

    @GetMapping("/programs")
    public ResponseEntity<List<SaleProgram>> listPrograms() {
        return ResponseEntity.ok(saleService.listAllPrograms());
    }

    @GetMapping("/programs/{id}")
    public ResponseEntity<SaleProgram> getProgram(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getProgramById(id));
    }

    @PostMapping("/programs")
    public ResponseEntity<SaleProgram> createProgram(
            @RequestBody SaleProgramRequest req,
            @RequestHeader(value = "X-Username", required = false) String username) {
        SaleProgram program = saleService.createProgram(req, username);
        if (Boolean.TRUE.equals(req.getSendEmailNotification())) {
            notificationAsyncService.sendPromotionEmails(program);
        }
        sendSaleActivityLog("SALE_PROGRAM_CREATE", "SaleProgram", String.valueOf(program.getId()), "POST", "/admin/sales/programs", program, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(program);
    }

    @PutMapping("/programs/{id}")
    public ResponseEntity<SaleProgram> updateProgram(
            @PathVariable Long id,
            @RequestBody SaleProgramRequest req,
            @RequestHeader(value = "X-Username", required = false) String username) {
        SaleProgram program = saleService.updateProgram(id, req, username);
        if (Boolean.TRUE.equals(req.getSendEmailNotification())) {
            notificationAsyncService.sendPromotionEmails(program);
        }
        sendSaleActivityLog("SALE_PROGRAM_UPDATE", "SaleProgram", String.valueOf(program.getId()), "PUT", "/admin/sales/programs/" + id, program, username);
        return ResponseEntity.ok(program);
    }

    @DeleteMapping("/programs/{id}")
    public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
        saleService.deleteProgram(id);
        sendSaleActivityLog("SALE_PROGRAM_DELETE", "SaleProgram", String.valueOf(id), "DELETE", "/admin/sales/programs/" + id, null, "admin");
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/programs/check-overlap")
    public ResponseEntity<com.rainbowforest.saleservice.dto.OverlapCheckResponse> checkOverlap(
            @RequestParam Long productId,
            @RequestParam(required = false) Long variantId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.ZonedDateTime startAt,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.ZonedDateTime endAt,
            @RequestParam(required = false) Long excludeProgramId) {
        boolean overlap = saleService.checkOverlap(productId, variantId, startAt, endAt, excludeProgramId);
        return ResponseEntity.ok(new com.rainbowforest.saleservice.dto.OverlapCheckResponse(overlap, 
            overlap ? "Sản phẩm/biến thể này đã tồn tại trong một chương trình khuyến mãi khác cùng thời điểm." : "OK"));
    }

    // ---- Vouchers ----

    @GetMapping("/vouchers")
    public ResponseEntity<List<Voucher>> listVouchers() {
        return ResponseEntity.ok(saleService.listAllVouchers());
    }

    @GetMapping("/vouchers/check-code")
    public ResponseEntity<Map<String, Boolean>> checkVoucherCode(
            @RequestParam String code,
            @RequestParam(required = false) Long excludeVoucherId) {
        boolean exists = saleService.checkVoucherCodeExists(code, excludeVoucherId);
        return ResponseEntity.ok(java.util.Collections.singletonMap("exists", exists));
    }

    @GetMapping("/vouchers/{id}")
    public ResponseEntity<Voucher> getVoucher(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getVoucherById(id));
    }

    @GetMapping("/vouchers/{id}/usages")
    public ResponseEntity<List<VoucherUsageResponse>> getVoucherUsages(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getVoucherUsages(id));
    }

    @PostMapping("/vouchers")
    public ResponseEntity<Voucher> createVoucher(
            @RequestBody VoucherRequest req,
            @RequestHeader(value = "X-Username", required = false) String username) {
        Voucher voucher = saleService.createVoucher(req, username);
        sendSaleActivityLog("VOUCHER_CREATE", "Voucher", String.valueOf(voucher.getId()), "POST", "/admin/sales/vouchers", voucher, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(voucher);
    }

    @PutMapping("/vouchers/{id}")
    public ResponseEntity<Voucher> updateVoucher(
            @PathVariable Long id,
            @RequestBody VoucherRequest req,
            @RequestHeader(value = "X-Username", required = false) String username) {
        Voucher voucher = saleService.updateVoucher(id, req, username);
        sendSaleActivityLog("VOUCHER_UPDATE", "Voucher", String.valueOf(voucher.getId()), "PUT", "/admin/sales/vouchers/" + id, voucher, username);
        return ResponseEntity.ok(voucher);
    }

    @DeleteMapping("/vouchers/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        saleService.deleteVoucher(id);
        sendSaleActivityLog("VOUCHER_DELETE", "Voucher", String.valueOf(id), "DELETE", "/admin/sales/vouchers/" + id, null, "admin");
        return ResponseEntity.noContent().build();
    }

    // ---- Banners ----

    @GetMapping("/banners")
    public ResponseEntity<List<PromoBanner>> listBanners() {
        return ResponseEntity.ok(saleService.listAllBanners());
    }

    @GetMapping("/banners/{id}")
    public ResponseEntity<PromoBanner> getBanner(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getBannerById(id));
    }

    @PostMapping("/banners")
    public ResponseEntity<PromoBanner> createBanner(
            @RequestBody PromoBanner banner,
            @RequestHeader(value = "X-Username", required = false) String username) {
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.createBanner(banner, username));
    }

    @PutMapping("/banners/{id}")
    public ResponseEntity<PromoBanner> updateBanner(
            @PathVariable Long id,
            @RequestBody PromoBanner patch,
            @RequestHeader(value = "X-Username", required = false) String username) {
        return ResponseEntity.ok(saleService.updateBanner(id, patch, username));
    }

    @DeleteMapping("/banners/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        saleService.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/banners/upload-image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadBannerImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestHeader(value = "X-Internal-Secret", required = false) String internalSecret,
            javax.servlet.http.HttpServletRequest request) {
        // Chỉ admin (qua gateway) hoặc internal service mới được upload.
        boolean internalCall = expectedInternalSecret != null && !expectedInternalSecret.isEmpty()
                && internalSecret != null && constantTimeEquals(internalSecret, expectedInternalSecret);
        if (!internalCall) {
            // Nếu không phải internal call thì kiểm tra role admin qua header gateway.
            String role = request.getHeader("X-User-Role");
            if (role == null || !role.toUpperCase(java.util.Locale.ROOT).contains("ADMIN")) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                        .body(java.util.Map.of("message", "Không có quyền upload"));
            }
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "File rỗng"));
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Tên file không hợp lệ"));
        }
        // Validate extension whitelist.
        int dotIdx = originalName.lastIndexOf('.');
        if (dotIdx < 0 || dotIdx == originalName.length() - 1) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "File thiếu extension"));
        }
        String ext = originalName.substring(dotIdx).toLowerCase(java.util.Locale.ROOT);
        java.util.Set<String> allowed = java.util.Set.of(".jpg", ".jpeg", ".png", ".webp");
        if (!allowed.contains(ext)) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Định dạng không hỗ trợ"));
        }
        // Size limit (10MB).
        if (file.getSize() > 10L * 1024 * 1024) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "File quá lớn (max 10MB)"));
        }
        // Validate MIME type.
        String ct = file.getContentType();
        if (ct == null || !ct.toLowerCase(java.util.Locale.ROOT).startsWith("image/")) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "MIME type không phải ảnh"));
        }
        // Validate magic bytes (chống bypass extension).
        try (java.io.InputStream is = file.getInputStream()) {
            byte[] head = new byte[8];
            int read = is.read(head);
            if (read < 4) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "File không hợp lệ"));
            }
            boolean validMagic = false;
            if (ext.equals(".jpg") || ext.equals(".jpeg")) {
                validMagic = (head[0] & 0xFF) == 0xFF && (head[1] & 0xFF) == 0xD8 && (head[2] & 0xFF) == 0xFF;
            } else if (ext.equals(".png")) {
                validMagic = head[0] == (byte) 0x89 && head[1] == 'P' && head[2] == 'N' && head[3] == 'G';
            } else if (ext.equals(".webp")) {
                validMagic = head[0] == 'R' && head[1] == 'I' && head[2] == 'F' && head[3] == 'F';
                if (validMagic && read >= 12) {
                    byte[] extBytes = new byte[4];
                    int n = is.read(extBytes);
                    validMagic = n == 4 && extBytes[0] == 'W' && extBytes[1] == 'E' && extBytes[2] == 'B' && extBytes[3] == 'P';
                }
            }
            if (!validMagic) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Nội dung file không khớp extension"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Lỗi đọc file"));
        }

        try {
            java.nio.file.Files.createDirectories(BANNER_UPLOAD_DIR);
            String filename = java.util.UUID.randomUUID().toString() + ext;
            java.nio.file.Path out = BANNER_UPLOAD_DIR.resolve(filename).normalize();
            // Đảm bảo đường dẫn nằm trong thư mục cho phép.
            if (!out.startsWith(BANNER_UPLOAD_DIR)) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Đường dẫn không hợp lệ"));
            }
            file.transferTo(out);
            String url = "/api/sales/banners/image/" + filename;
            return ResponseEntity.ok(java.util.Map.of("uploaded", true, "url", url));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Lỗi upload"));
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
