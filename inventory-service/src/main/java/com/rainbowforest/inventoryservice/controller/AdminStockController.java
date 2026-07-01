package com.rainbowforest.inventoryservice.controller;

import com.rainbowforest.inventoryservice.dto.StockOperationRequest;
import com.rainbowforest.inventoryservice.dto.StockMovementResponse;
import com.rainbowforest.inventoryservice.entity.InventoryBalance;
import com.rainbowforest.inventoryservice.entity.StockMovement;
import com.rainbowforest.inventoryservice.service.StockService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/stock")
public class AdminStockController {

    private final StockService stockService;
    private final com.rainbowforest.inventoryservice.service.ExcelService excelService;

    public AdminStockController(StockService stockService, com.rainbowforest.inventoryservice.service.ExcelService excelService) {
        this.stockService = stockService;
        this.excelService = excelService;
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
        return new ResponseEntity<>(StockMovementResponse.from(m), HttpStatus.CREATED);
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Map.of("message", "Lỗi đọc file: " + e.getMessage()));
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
}

