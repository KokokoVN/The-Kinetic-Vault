package com.rainbowforest.inventoryservice.service;

import com.rainbowforest.inventoryservice.client.ProductCatalogInternalClient;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelService {

    private final StockService stockService;
    private final ProductCatalogInternalClient productClient;

    public ExcelService(StockService stockService, ProductCatalogInternalClient productClient) {
        this.stockService = stockService;
        this.productClient = productClient;
    }

    public byte[] generateTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Nhập_Xuất_Kho");

            Row headerRow = sheet.createRow(0);
            String[] columns = {"Mã sản phẩm", "Mã biến thể", "Số lượng", "Loại (INBOUND/OUTBOUND)", "Đơn giá", "Ghi chú"};

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                CellStyle style = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue(1);
            exampleRow.createCell(1).setCellValue(2);
            exampleRow.createCell(2).setCellValue(100);
            exampleRow.createCell(3).setCellValue("INBOUND");
            exampleRow.createCell(4).setCellValue(150000);
            exampleRow.createCell(5).setCellValue("Nhập kho lô hàng mới");

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                workbook.write(out);
                return out.toByteArray();
            }
        }
    }

    public List<ExcelRowDto> previewExcel(MultipartFile file) throws IOException {
        List<ExcelRowDto> rows = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || row.getCell(0) == null) continue;

                ExcelRowDto dto = new ExcelRowDto();
                dto.setRowId(i);
                dto.setValid(true);
                dto.setErrorMessages(new ArrayList<>());

                try {
                    // Col 0: Product ID
                    dto.setProductId(getCellValueAsLong(row.getCell(0)));

                    // Col 1: Product Name
                    dto.setProductName(getCellValueAsString(row.getCell(1)));

                    // Col 2: Variant ID
                    dto.setVariantId(getCellValueAsLong(row.getCell(2)));

                    // Col 3: Variant Attributes (Màu / Size)
                    dto.setVariantAttributes(getCellValueAsString(row.getCell(3)));

                    // Col 4: Quantity
                    Long qty = getCellValueAsLong(row.getCell(4));
                    if (qty != null) {
                        dto.setQuantity(qty.intValue());
                    }

                    // Default type
                    dto.setType("INBOUND");

                    // Col 5: Unit Cost
                    BigDecimal cost = getCellValueAsBigDecimal(row.getCell(5));
                    if (cost != null) {
                        dto.setUnitCost(cost);
                    } else {
                        dto.setUnitCost(BigDecimal.ZERO);
                    }

                    // Col 6: Note
                    dto.setNote(getCellValueAsString(row.getCell(6)));

                    // Validation
                    if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
                        dto.setValid(false);
                        dto.getErrorMessages().add("Số lượng phải lớn hơn 0");
                    }

                    if (!"INBOUND".equals(dto.getType()) && !"OUTBOUND".equals(dto.getType())) {
                        dto.setValid(false);
                        dto.getErrorMessages().add("Loại giao dịch phải là INBOUND hoặc OUTBOUND");
                    }

                    if (dto.getProductId() != null) {
                        try {
                            Object p = productClient.getProduct(dto.getProductId());
                            if (p == null) {
                                dto.setValid(false);
                                dto.getErrorMessages().add("Sản phẩm không tồn tại");
                            }
                        } catch (Exception ex) {
                            dto.setValid(false);
                            dto.getErrorMessages().add("Sản phẩm không tồn tại hoặc lỗi kết nối Catalog");
                        }
                    } else {
                        dto.setValid(false);
                        dto.getErrorMessages().add("Thiếu Mã sản phẩm");
                    }

                    if (dto.isValid() && "OUTBOUND".equals(dto.getType())) {
                        int currentStock = 0;
                        List<com.rainbowforest.inventoryservice.entity.InventoryBalance> balances = stockService.balancesForProduct(dto.getProductId());
                        for (com.rainbowforest.inventoryservice.entity.InventoryBalance b : balances) {
                            if ((dto.getVariantId() == null && b.getVariantId() == null) ||
                                (dto.getVariantId() != null && dto.getVariantId().equals(b.getVariantId()))) {
                                currentStock = b.getQuantityOnHand();
                                break;
                            }
                        }
                        if (currentStock < dto.getQuantity()) {
                            dto.setValid(false);
                            dto.getErrorMessages().add("Số lượng xuất (" + dto.getQuantity() + ") vượt quá tồn kho (" + currentStock + ")");
                        }
                    }

                } catch (Exception e) {
                    dto.setValid(false);
                    dto.getErrorMessages().add("Lỗi định dạng dữ liệu: " + e.getMessage());
                }
                rows.add(dto);
            }
        }
        return rows;
    }

    public ImportResult confirmImport(List<ExcelRowDto> rows, String performedBy) {
        ImportResult result = new ImportResult();
        for (ExcelRowDto row : rows) {
            if (row.isValid()) {
                try {
                    if ("INBOUND".equals(row.getType())) {
                        stockService.inbound(row.getProductId(), row.getVariantId(), row.getQuantity(), "EXCEL_IMPORT", null, row.getNote(), row.getUnitCost(), null, performedBy);
                        result.incrementSuccess();
                    } else if ("OUTBOUND".equals(row.getType())) {
                        stockService.outbound(row.getProductId(), row.getVariantId(), row.getQuantity(), "EXCEL_IMPORT", null, row.getNote(), row.getUnitCost(), null, performedBy);
                        result.incrementSuccess();
                    }
                } catch (Exception e) {
                    result.addError("Dòng " + row.getRowId() + ": Lỗi lưu (" + e.getMessage() + ")");
                }
            } else {
                result.addError("Dòng " + row.getRowId() + " không hợp lệ, bị bỏ qua.");
            }
        }
        return result;
    }

    public static class ExcelRowDto {
        private int rowId;
        private Long productId;
        private String productName;
        private Long variantId;
        private String variantAttributes;
        private Integer quantity;
        private String type;
        private BigDecimal unitCost;
        private String note;
        private boolean valid;
        private List<String> errorMessages = new ArrayList<>();

        public int getRowId() { return rowId; }
        public void setRowId(int rowId) { this.rowId = rowId; }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public Long getVariantId() { return variantId; }
        public void setVariantId(Long variantId) { this.variantId = variantId; }

        public String getVariantAttributes() { return variantAttributes; }
        public void setVariantAttributes(String variantAttributes) { this.variantAttributes = variantAttributes; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public BigDecimal getUnitCost() { return unitCost; }
        public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }

        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }

        public List<String> getErrorMessages() { return errorMessages; }
        public void setErrorMessages(List<String> errorMessages) { this.errorMessages = errorMessages; }
    }

    public static class ImportResult {
        private int successCount = 0;
        private List<String> errors = new ArrayList<>();

        public int getSuccessCount() { return successCount; }
        public void incrementSuccess() { this.successCount++; }

        public List<String> getErrors() { return errors; }
        public void addError(String error) { this.errors.add(error); }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue();
        if (cell.getCellType() == CellType.NUMERIC) {
            double num = cell.getNumericCellValue();
            if (num == (long) num) return String.valueOf((long) num);
            return String.valueOf(num);
        }
        return null;
    }

    private Long getCellValueAsLong(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) return (long) cell.getNumericCellValue();
        if (cell.getCellType() == CellType.STRING) {
            String val = cell.getStringCellValue().trim();
            if (val.isEmpty()) return null;
            try { return Long.parseLong(val); } catch (Exception e) { return null; }
        }
        return null;
    }

    private BigDecimal getCellValueAsBigDecimal(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) return BigDecimal.valueOf(cell.getNumericCellValue());
        if (cell.getCellType() == CellType.STRING) {
            String val = cell.getStringCellValue().trim();
            if (val.isEmpty()) return null;
            try { return new BigDecimal(val); } catch (Exception e) { return null; }
        }
        return null;
    }
}
