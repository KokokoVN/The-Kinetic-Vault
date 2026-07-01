package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.dto.ProductExcelRowDto;
import com.rainbowforest.productcatalogservice.service.ProductExcelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.rainbowforest.productcatalogservice.dto.InventoryTemplateRequestDto;

@RestController
@RequestMapping("/admin/products/excel")
public class AdminProductExcelController {

    private final ProductExcelService productExcelService;

    public AdminProductExcelController(ProductExcelService productExcelService) {
        this.productExcelService = productExcelService;
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() throws IOException {
        byte[] excelContent = productExcelService.generateTemplate();
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "Product_Template.xlsx");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
    }

    @PostMapping("/inventory-template")
    public ResponseEntity<byte[]> downloadInventoryTemplate(@RequestBody InventoryTemplateRequestDto request) throws IOException {
        if ((request.getProductIds() == null || request.getProductIds().isEmpty()) && 
            (request.getVariantIds() == null || request.getVariantIds().isEmpty())) {
            return ResponseEntity.badRequest().build();
        }
        byte[] excelContent = productExcelService.generateInventoryTemplate(request);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "Inventory_Template.xlsx");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
    }

    @PostMapping(value = "/preview", consumes = "multipart/form-data")
    public ResponseEntity<List<ProductExcelRowDto>> previewExcel(@RequestParam("file") MultipartFile file) {
        try {
            List<ProductExcelRowDto> previewRows = productExcelService.previewExcel(file);
            return ResponseEntity.ok(previewRows);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirmImport(
            @RequestBody List<ProductExcelRowDto> rows,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        Map<String, Object> result = productExcelService.confirmImport(rows, username, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/generate-errors")
    public ResponseEntity<byte[]> generateErrorExcel(@RequestBody List<ProductExcelRowDto> rows) throws IOException {
        byte[] excelContent = productExcelService.generateErrorExcel(rows);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "Product_Import_Errors.xlsx");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
    }
}
