package com.rainbowforest.saleservice.controller;

import com.rainbowforest.saleservice.dto.SaleProgramRequest;
import com.rainbowforest.saleservice.dto.VoucherRequest;
import com.rainbowforest.saleservice.dto.VoucherUsageResponse;
import com.rainbowforest.saleservice.entity.PromoBanner;
import com.rainbowforest.saleservice.entity.SaleProgram;
import com.rainbowforest.saleservice.entity.Voucher;
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

    // ---- Sale Programs ----

    private static final java.nio.file.Path BANNER_UPLOAD_DIR = java.nio.file.Paths.get("uploads", "banner-images");

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
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.createProgram(req, username));
    }

    @PutMapping("/programs/{id}")
    public ResponseEntity<SaleProgram> updateProgram(
            @PathVariable Long id,
            @RequestBody SaleProgramRequest req,
            @RequestHeader(value = "X-Username", required = false) String username) {
        return ResponseEntity.ok(saleService.updateProgram(id, req, username));
    }

    @DeleteMapping("/programs/{id}")
    public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
        saleService.deleteProgram(id);
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
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.createVoucher(req, username));
    }

    @PutMapping("/vouchers/{id}")
    public ResponseEntity<Voucher> updateVoucher(
            @PathVariable Long id,
            @RequestBody VoucherRequest req,
            @RequestHeader(value = "X-Username", required = false) String username) {
        return ResponseEntity.ok(saleService.updateVoucher(id, req, username));
    }

    @DeleteMapping("/vouchers/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        saleService.deleteVoucher(id);
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
    public ResponseEntity<?> uploadBannerImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(java.util.Map.of("message", "File rỗng"));
        try {
            java.nio.file.Files.createDirectories(BANNER_UPLOAD_DIR);
            String ext = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.lastIndexOf(".") > 0) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }
            String filename = java.util.UUID.randomUUID().toString() + ext;
            java.nio.file.Path out = BANNER_UPLOAD_DIR.resolve(filename);
            file.transferTo(out);
            String url = "/api/sales/banners/image/" + filename;
            return ResponseEntity.ok(java.util.Map.of("uploaded", true, "url", url));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Map.of("message", "Lỗi upload", "error", e.getMessage()));
        }
    }
}
