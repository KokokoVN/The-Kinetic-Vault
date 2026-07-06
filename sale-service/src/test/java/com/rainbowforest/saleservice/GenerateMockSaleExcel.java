package com.rainbowforest.saleservice;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.Test;

import java.io.FileOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class GenerateMockSaleExcel {

    @Test
    public void generate() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Khuyen_Mai");

        Row headerRow = sheet.createRow(0);
        String[] columns = {
            "Tên Chương Trình", "Mô tả", "Loại Giảm (PERCENT/AMOUNT)", "Mức Giảm", 
            "Bắt đầu (YYYY-MM-DDTHH:mm)", "Kết thúc (YYYY-MM-DDTHH:mm)", 
            "Mã SP", "Mã BT", "Giới hạn Số lượng"
        };

        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            CellStyle style = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            style.setFont(font);
            cell.setCellStyle(style);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
        String start = LocalDateTime.now().format(formatter);
        String end = LocalDateTime.now().plusDays(15).format(formatter);

        // We will create a massive sale program that applies 15% discount to all 10 products
        for (int i = 0; i < 10; i++) {
            Row row = sheet.createRow(i + 1);
            
            // Configuration is read from the first row, but we can fill it for all or just first
            row.createCell(0).setCellValue("Siêu Sale Khai Trương 15%");
            row.createCell(1).setCellValue("Giảm 15% toàn bộ gian hàng");
            row.createCell(2).setCellValue("PERCENT");
            row.createCell(3).setCellValue(15);
            row.createCell(4).setCellValue(start);
            row.createCell(5).setCellValue(end);
            
            // Applicable Products: IDs 1 to 10. Leaving "Mã BT" empty to apply to all variants of the product
            row.createCell(6).setCellValue(i + 1); // Mã SP
            // Mã BT (empty)
            row.createCell(8).setCellValue(50); // Limit 50 items per product
        }

        try (FileOutputStream out = new FileOutputStream("e:\\\\e-commerce-microservices-master\\\\e-commerce-microservices-master\\\\Data_Khuyen_Mai.xlsx")) {
            workbook.write(out);
        }
        workbook.close();
    }
}
