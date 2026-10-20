package com.rainbowforest.saleservice.controller;

import com.rainbowforest.saleservice.dto.PromoBannerCacheDto;
import com.rainbowforest.saleservice.dto.SaleProgramCacheDto;
import com.rainbowforest.saleservice.dto.VoucherApplyResponse;
import com.rainbowforest.saleservice.entity.PromoBanner;
import com.rainbowforest.saleservice.entity.SaleProgram;
import com.rainbowforest.saleservice.entity.Voucher;
import com.rainbowforest.saleservice.service.SaleServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
public class PublicSaleController {

    @Autowired
    private SaleServiceImpl saleService;

    private static java.nio.file.Path getRootUploadPath(String subDir) {
        java.nio.file.Path path = java.nio.file.Paths.get(System.getProperty("user.dir"));
        if (path.getFileName().toString().endsWith("-service")) {
            path = path.getParent();
        }
        return path.resolve("uploads").resolve(subDir);
    }
    private static final java.nio.file.Path BANNER_UPLOAD_DIR = getRootUploadPath("banner-images");

    @GetMapping({"/banners/image/{filename:.+}", "/sales/banners/image/{filename:.+}"})
    public ResponseEntity<org.springframework.core.io.Resource> serveBannerImage(@PathVariable String filename) {
        try {
            java.nio.file.Path file = BANNER_UPLOAD_DIR.resolve(filename).normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                String contentType = "application/octet-stream";
                if (filename.toLowerCase().endsWith(".png")) contentType = "image/png";
                else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) contentType = "image/jpeg";
                else if (filename.toLowerCase().endsWith(".gif")) contentType = "image/gif";
                return ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, contentType)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /** Storefront: lấy danh sách chương trình sale đang chạy */
    @GetMapping({"/active", "/sales/active"})
    public ResponseEntity<List<SaleProgramCacheDto>> getActivePrograms() {
        return ResponseEntity.ok(saleService.listActivePrograms());
    }

    /** Storefront checkout: lấy voucher đang có hiệu lực */
    @GetMapping({"/vouchers/active", "/sales/vouchers/active"})
    public ResponseEntity<List<Voucher>> getActiveVouchers() {
        return ResponseEntity.ok(saleService.listActiveVouchers());
    }

    /** Storefront: lấy banner đang active */
    @GetMapping({"/banners", "/sales/banners"})
    public ResponseEntity<List<PromoBannerCacheDto>> getActiveBanners() {
        return ResponseEntity.ok(saleService.listActiveBanners());
    }

    /** Lấy số lần sử dụng voucher của user. Yêu cầu authentication (chỉ chính user/admin). */
    @GetMapping({"/vouchers/my-usage", "/sales/vouchers/my-usage"})
    public ResponseEntity<Map<String, Integer>> getMyVoucherUsage(
            @RequestParam Long userId,
            @RequestHeader(value = "X-User-Id", required = false) String callerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (userId == null) return ResponseEntity.badRequest().build();
        // IDOR protection: chỉ admin hoặc chính user được xem.
        if (!"ADMIN".equalsIgnoreCase(role)) {
            if (callerUserId == null || callerUserId.trim().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            try {
                long caller = Long.parseLong(callerUserId.trim());
                if (caller != userId.longValue()) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
            } catch (NumberFormatException e) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }
        return ResponseEntity.ok(saleService.getUserVoucherUsage(userId));
    }

    /**
     * Validate voucher mà không consume.
     * Body: { "code": "SUMMER20", "userId": 1, "orderAmount": 500000 }
     */
    @PostMapping({"/vouchers/validate", "/sales/vouchers/validate"})
    public ResponseEntity<VoucherApplyResponse> validateVoucher(@RequestBody Map<String, Object> body) {
        String code = String.valueOf(body.getOrDefault("code", "")).trim();
        Long userId = toLong(body.get("userId"));
        BigDecimal orderAmount = toBigDecimal(body.get("orderAmount"));
        if (code.isEmpty() || userId == null || orderAmount == null) {
            return ResponseEntity.badRequest().body(VoucherApplyResponse.error(code, "Thiếu thông tin: code, userId, orderAmount."));
        }
        return ResponseEntity.ok(saleService.validateVoucher(code, userId, orderAmount));
    }

    /**
     * Consume (lock) voucher sau khi order được tạo thành công.
     * Được gọi bởi order-service qua Feign.
     * Body: { "code": "SUMMER20", "userId": 1, "orderId": 42 }
     */
    @PostMapping({"/vouchers/consume", "/sales/vouchers/consume"})
    public ResponseEntity<Map<String, Object>> consumeVoucher(@RequestBody Map<String, Object> body) {
        String code = String.valueOf(body.getOrDefault("code", "")).trim();
        Long userId = toLong(body.get("userId"));
        Long orderId = toLong(body.get("orderId"));
        if (code.isEmpty() || userId == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Thiếu thông tin."));
        }
        try {
            saleService.consumeVoucher(code, userId, orderId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "BAD_REQUEST", "message", "Dữ liệu không hợp lệ"));
        }
    }

    /**
     * Trừ số lượng khuyến mãi sau khi tạo đơn hàng thành công.
     */
    @PostMapping({"/programs/consume-qty", "/sales/programs/consume-qty"})
    public ResponseEntity<Map<String, Object>> consumeSaleQty(@RequestBody com.rainbowforest.saleservice.dto.ConsumeSaleQtyRequest req) {
        if (req == null || req.getProductId() == null || req.getQuantity() == null || req.getQuantity() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Thiếu productId hoặc quantity không hợp lệ."));
        }
        try {
            saleService.consumeSaleQty(req.getProductId(), req.getVariantId(), req.getQuantity());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "BAD_REQUEST", "message", "Dữ liệu không hợp lệ"));
        }
    }

    private Long toLong(Object val) {
        if (val == null) return null;
        try { return Long.parseLong(String.valueOf(val)); } catch (Exception e) { return null; }
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return null;
        try { return new BigDecimal(String.valueOf(val)); } catch (Exception e) { return null; }
    }
}
