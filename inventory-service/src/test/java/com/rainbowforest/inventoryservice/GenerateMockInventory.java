package com.rainbowforest.inventoryservice;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.Test;

import java.io.FileOutputStream;

public class GenerateMockInventory {

    @Test
    public void generate() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Nhập_Xuất_Kho");

        Row headerRow = sheet.createRow(0);
        String[] columns = {"Mã sản phẩm", "Tên sản phẩm", "Mã biến thể", "Thuộc tính Biến thể (Màu / Size)", "Số lượng", "Đơn giá", "Ghi chú"};

        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            CellStyle style = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            style.setFont(font);
            cell.setCellStyle(style);
        }

        String[] productNames = {
            "iPhone 15 Pro Max", "Samsung Galaxy S24 Ultra", "MacBook Pro 14 M3", 
            "Sony PlayStation 5", "iPad Pro M4 11-inch", "Apple Watch Series 9",
            "Tai nghe AirPods Pro 2", "Laptop Dell XPS 15", "Samsung Galaxy Z Fold5", "Loa Marshall Stanmore III"
        };
        long[] basePrices = {29000000, 31000000, 39000000, 15000000, 28000000, 10000000, 6000000, 45000000, 40000000, 9000000};
        
        String[] sizes = {"Tiêu chuẩn", "Pro", "Ultra"};
        String[] colors = {"Trắng", "Đen", "Xanh", "Đỏ"};

        int rowIdx = 1;
        long variantId = 1;
        
        for (int p = 0; p < 10; p++) {
            long productId = p + 1;
            
            for (int s = 0; s < sizes.length; s++) {
                for (int c = 0; c < colors.length; c++) {
                    Row row = sheet.createRow(rowIdx++);
                    
                    row.createCell(0).setCellValue(productId);
                    row.createCell(1).setCellValue(productNames[p]);
                    row.createCell(2).setCellValue(variantId++);
                    row.createCell(3).setCellValue("Size: " + sizes[s] + " - Màu: " + colors[c]);
                    
                    // Quantity
                    row.createCell(4).setCellValue(100); 
                    
                    // Cost (70% of retail price)
                    double cost = (basePrices[p] + (s * 3000000)) * 0.7;
                    row.createCell(5).setCellValue(cost); 
                    
                    // Note
                    row.createCell(6).setCellValue("Nhập kho khai trương");
                }
            }
        }

        try (FileOutputStream out = new FileOutputStream("e:\\\\e-commerce-microservices-master\\\\e-commerce-microservices-master\\\\Data_Nhap_Kho.xlsx")) {
            workbook.write(out);
        }
        workbook.close();
    }
}
