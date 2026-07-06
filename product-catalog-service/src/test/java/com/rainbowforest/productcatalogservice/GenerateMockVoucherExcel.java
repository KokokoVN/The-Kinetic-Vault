package com.rainbowforest.productcatalogservice;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.Test;

import java.io.FileOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class GenerateMockVoucherExcel {

    @Test
    public void generate() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Voucher");

        Row headerRow = sheet.createRow(0);
        String[] columns = {
            "Mã Voucher", "Mô tả", "Loại giảm (PERCENT/AMOUNT)", "Mức giảm", 
            "Giảm tối đa", "Đơn tối thiểu", "Giới hạn toàn HT", "Giới hạn/Người", 
            "Ngày bắt đầu (YYYY-MM-DDTHH:mm)", "Ngày kết thúc (YYYY-MM-DDTHH:mm)", "Kích hoạt (TRUE/FALSE)"
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
        String end = LocalDateTime.now().plusDays(30).format(formatter);
        
        Object[][] vouchers = {
            {"VIP100K", "Giảm thẳng 100k cho đơn từ 1 triệu", "AMOUNT", 100000, "", 1000000, 1000, 1, start, end, "TRUE"},
            {"MEGA10", "Giảm 10% tối đa 500k", "PERCENT", 10, 500000, 2000000, 500, 2, start, end, "TRUE"},
            {"FREESHIP", "Mã Miễn phí vận chuyển (Giảm 50k)", "AMOUNT", 50000, "", 0, 5000, 5, start, LocalDateTime.now().plusDays(90).format(formatter), "TRUE"},
            {"NEWUSER500", "Chào bạn mới, giảm 500k đơn 5 củ", "AMOUNT", 500000, "", 5000000, 200, 1, start, end, "TRUE"},
            {"HIGHTECH20", "Giảm 20% phụ kiện", "PERCENT", 20, 200000, 500000, 100, 1, start, end, "TRUE"}
        };

        for (int i = 0; i < vouchers.length; i++) {
            Row row = sheet.createRow(i + 1);
            for (int j = 0; j < vouchers[i].length; j++) {
                Object val = vouchers[i][j];
                if (val instanceof String) {
                    row.createCell(j).setCellValue((String) val);
                } else if (val instanceof Integer) {
                    row.createCell(j).setCellValue((Integer) val);
                }
            }
        }

        try (FileOutputStream out = new FileOutputStream("e:\\\\e-commerce-microservices-master\\\\e-commerce-microservices-master\\\\Data_Voucher.xlsx")) {
            workbook.write(out);
        }
        workbook.close();
    }
}
