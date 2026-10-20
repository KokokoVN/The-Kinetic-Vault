package com.rainbowforest.inventoryservice.controller;

import com.rainbowforest.inventoryservice.dto.StockOperationRequest;
import com.rainbowforest.inventoryservice.dto.StockMovementResponse;
import com.rainbowforest.inventoryservice.entity.InventoryBalance;
import com.rainbowforest.inventoryservice.entity.StockMovement;
import com.rainbowforest.inventoryservice.service.StockService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/stock")
public class AdminStockController {

    private static final Logger log = LoggerFactory.getLogger(AdminStockController.class);

    private final StockService stockService;
    private final com.rainbowforest.inventoryservice.service.ExcelService excelService;
    private final com.rainbowforest.inventoryservice.client.ActivityLogFeignClient activityLogFeignClient;

    public AdminStockController(StockService stockService,
                                com.rainbowforest.inventoryservice.service.ExcelService excelService,
                                com.rainbowforest.inventoryservice.client.ActivityLogFeignClient activityLogFeignClient) {
        this.stockService = stockService;
        this.excelService = excelService;
        this.activityLogFeignClient = activityLogFeignClient;
    }

    @GetMapping(value = {"", "/list"})
    public ResponseEntity<List<InventoryBalance>> getStock(@RequestParam(value = "skuCode", required = false) String skuCode) {
        List<InventoryBalance> list = stockService.getAllBalances(org.springframework.data.domain.PageRequest.of(0, 200)).getContent();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/adjust")
    public ResponseEntity<?> adjustStock(@RequestBody AdjustStockRequest req, @RequestHeader(value = "X-User-Name", defaultValue = "Admin") String performedBy) {
        if (req == null || (req.getProductId() == null && req.getVariantId() == null)) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "productId hoặc variantId là bắt buộc"));
        }
        int change = req.getChangeQuantity() != null ? req.getChangeQuantity() : 0;
        Long productId = req.getProductId() != null ? req.getProductId() : 0L;
        String note = req.getReason() != null ? req.getReason() : "Điều chỉnh tồn kho thủ công";
        
        StockMovement m;
        if (change >= 0) {
            m = stockService.inbound(productId, req.getVariantId(), Math.max(1, change), "ADJUST", null, note, null, null, performedBy);
        } else {
            m = stockService.outbound(productId, req.getVariantId(), Math.abs(change), "ADJUST", null, note, null, null, performedBy);
        }
        sendStockActivityLog("STOCK_ADJUST", "POST", "/admin/stock/adjust", m, performedBy);
        return ResponseEntity.ok(StockMovementResponse.from(m));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryBalance>> getLowStock() {
        List<InventoryBalance> lowStock = stockService.getAllBalances(org.springframework.data.domain.PageRequest.of(0, 500))
                .getContent().stream()
                .filter(b -> b.getQuantityOnHand() < 10)
                .collect(Collectors.toList());
        return ResponseEntity.ok(lowStock);
    }

    @PostMapping("/inbound")
    public ResponseEntity<StockMovementResponse> inbound(@Valid @RequestBody StockOperationRequest req) {
        StockMovement m = stockService.inbound(
                req.getProductId(),
                req.getVariantId(),
                req.getQuantity(),
                req.getReferenceType(),
                req.getReferenceId(),
                req.getNote(),
                req.getUnitCost(),
                req.getMovementAt(),
                req.getPerformedBy());
        sendStockActivityLog("STOCK_INBOUND", "POST", "/admin/stock/inbound", m, req.getPerformedBy());
        return new ResponseEntity<>(StockMovementResponse.from(m), HttpStatus.CREATED);
    }

    @PostMapping("/outbound")
    public ResponseEntity<StockMovementResponse> outbound(@Valid @RequestBody StockOperationRequest req) {
        StockMovement m = stockService.outbound(
                req.getProductId(),
                req.getVariantId(),
                req.getQuantity(),
                req.getReferenceType(),
                req.getReferenceId(),
                req.getNote(),
                req.getUnitCost(),
                req.getMovementAt(),
                req.getPerformedBy());
        sendStockActivityLog("STOCK_OUTBOUND", "POST", "/admin/stock/outbound", m, req.getPerformedBy());
        return new ResponseEntity<>(StockMovementResponse.from(m), HttpStatus.CREATED);
    }

    private void sendStockActivityLog(String action, String method, String path, StockMovement m, String performedBy) {
        try {
            java.util.Map<String, Object> after = new java.util.LinkedHashMap<>();
            after.put("movementId", m.getId());
            after.put("productId", m.getProductId());
            after.put("variantId", m.getVariantId());
            after.put("movementType", m.getMovementType());
            after.put("quantity", m.getQuantity());
            after.put("balanceAfter", m.getBalanceAfter());
            after.put("note", m.getNote());
            java.util.Map<String, Object> detail = new java.util.LinkedHashMap<>();
            detail.put("resourceType", "StockMovement");
            detail.put("after", after);
            
            java.util.Map<String, Object> logReq = new java.util.LinkedHashMap<>();
            logReq.put("action", action);
            logReq.put("resourceType", "StockMovement");
            logReq.put("resourceId", String.valueOf(m.getId()));
            logReq.put("httpMethod", method);
            logReq.put("requestPath", path);
            logReq.put("performedBy", performedBy != null ? performedBy : "system");
            logReq.put("detailJson", new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(detail));
            activityLogFeignClient.log(logReq);
        } catch (Exception ignored) {}
    }

    @GetMapping("/balance/{productId}")
    public ResponseEntity<List<InventoryBalance>> balance(@PathVariable Long productId) {
        return ResponseEntity.ok(stockService.balancesForProduct(productId));
    }

    @GetMapping("/balances")
    public ResponseEntity<org.springframework.data.domain.Page<InventoryBalance>> getBalances(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(stockService.getAllBalances(org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("updatedAt").descending())));
    }

    @GetMapping("/movements/{productId}")
    public ResponseEntity<List<StockMovementResponse>> movements(@PathVariable Long productId) {
        List<StockMovementResponse> rows = stockService.movementsForProduct(productId)
                .stream()
                .map(StockMovementResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rows);
    }

    @GetMapping("/movements")
    public ResponseEntity<org.springframework.data.domain.Page<StockMovementResponse>> getAllMovements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        org.springframework.data.domain.Page<StockMovementResponse> movements = stockService.getAllMovements(
                org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("movementAt").descending()))
                .map(StockMovementResponse::from);
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/excel/template")
    public ResponseEntity<byte[]> downloadTemplate() throws java.io.IOException {
        byte[] excelContent = excelService.generateTemplate();
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "Inventory_Template.xlsx");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
    }

    @PostMapping(value = "/excel/preview", consumes = "multipart/form-data")
    public ResponseEntity<?> previewExcel(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            List<com.rainbowforest.inventoryservice.service.ExcelService.ExcelRowDto> rows = excelService.previewExcel(file);
            return ResponseEntity.ok(rows);
        } catch (Exception e) {
            log.warn("Excel preview failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Map.of("error", "EXCEL_PREVIEW_FAILED", "message", "Không thể đọc file Excel"));
        }
    }

    @PostMapping(value = "/excel/confirm")
    public ResponseEntity<com.rainbowforest.inventoryservice.service.ExcelService.ImportResult> confirmExcel(
            @RequestBody List<com.rainbowforest.inventoryservice.service.ExcelService.ExcelRowDto> rows,
            @RequestHeader(value = "X-User-Name", defaultValue = "Admin") String performedBy) {
        try {
            com.rainbowforest.inventoryservice.service.ExcelService.ImportResult result = excelService.confirmImport(rows, performedBy);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            com.rainbowforest.inventoryservice.service.ExcelService.ImportResult res = new com.rainbowforest.inventoryservice.service.ExcelService.ImportResult();
            res.addError("Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    public static class AdjustStockRequest {
        private Long productId;
        private Long variantId;
        private Integer changeQuantity;
        private Integer quantity;
        private String reason;
        private String skuCode;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Long getVariantId() { return variantId; }
        public void setVariantId(Long variantId) { this.variantId = variantId; }
        public Integer getChangeQuantity() { return changeQuantity != null ? changeQuantity : quantity; }
        public void setChangeQuantity(Integer changeQuantity) { this.changeQuantity = changeQuantity; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getSkuCode() { return skuCode; }
        public void setSkuCode(String skuCode) { this.skuCode = skuCode; }
    }
}

