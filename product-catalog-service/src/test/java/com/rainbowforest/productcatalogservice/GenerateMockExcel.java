package com.rainbowforest.productcatalogservice;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.Test;

import java.io.FileOutputStream;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

public class GenerateMockExcel {

    @Test
    public void generate() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Import_San_Pham");

        Row headerRow = sheet.createRow(0);
        List<String> columnsList = new ArrayList<>(Arrays.asList("SKU", "Tên sản phẩm", "Mô tả", "Giá cơ bản", "Brand ID", "Category ID", "Kích thước (Size)", "Màu sắc (Color)", "Giá biến thể"));
        for (int i = 1; i <= 5; i++) {
            columnsList.add("Nhóm thông số " + i);
            columnsList.add("Tên thông số " + i);
            columnsList.add("Giá trị " + i);
            columnsList.add("Đơn vị " + i);
        }
        String[] columns = columnsList.toArray(new String[0]);
        for (int i = 0; i < columns.length; i++) {
            headerRow.createCell(i).setCellValue(columns[i]);
        }

        int rowIdx = 1;
        
        String[] productNames = {
            "iPhone 15 Pro Max", "Samsung Galaxy S24 Ultra", "MacBook Pro 14 M3", 
            "Sony PlayStation 5", "iPad Pro M4 11-inch", "Apple Watch Series 9",
            "Tai nghe AirPods Pro 2", "Laptop Dell XPS 15", "Samsung Galaxy Z Fold5", "Loa Marshall Stanmore III"
        };
        String[] descs = {
            "Smartphone cao cấp nhất của Apple với khung Titan siêu nhẹ, chip A17 Pro mạnh mẽ.",
            "Điện thoại AI đỉnh cao từ Samsung, camera 200MP zoom quang học 5x, kèm bút S-Pen.",
            "Laptop chuyên nghiệp trang bị chip M3 siêu mạnh, màn hình Liquid Retina XDR.",
            "Máy chơi game Console thế hệ mới với ổ cứng SSD tốc độ cao, tay cầm DualSense.",
            "Máy tính bảng mạnh nhất thế giới với chip M4, màn hình OLED siêu mỏng.",
            "Đồng hồ thông minh theo dõi sức khỏe, chip S9 mới với tính năng Chạm hai lần (Double Tap).",
            "Tai nghe không dây chống ồn chủ động xuất sắc, chip H2 mang lại âm thanh sống động.",
            "Laptop Windows cao cấp, màn hình viền mỏng InfinityEdge OLED tuyệt đẹp.",
            "Điện thoại gập cao cấp, bản lề Flex siêu khít, đa nhiệm mạnh mẽ.",
            "Loa Bluetooth phong cách cổ điển, âm thanh uy lực, kết nối ổn định."
        };
        long[] basePrices = {29000000, 31000000, 39000000, 15000000, 28000000, 10000000, 6000000, 45000000, 40000000, 9000000};
        int[] brandIds = {1, 2, 1, 3, 1, 1, 1, 4, 2, 5}; 
        int[] catIds = {1, 1, 2, 4, 3, 5, 4, 2, 1, 4}; 
        
        String[] sizes = {"Tiêu chuẩn", "Pro", "Ultra"};
        String[] colors = {"Trắng", "Đen", "Xanh", "Đỏ"};
        
        // Spec generation arrays
        String[] specGroups = {"Hiệu năng", "Màn hình", "Pin & Sạc", "Kết nối", "Thiết kế"};
        String[] specKeys = {"Vi xử lý", "RAM", "ROM", "Kích thước màn hình", "Công nghệ màn hình", "Độ phân giải", "Tần số quét", "Dung lượng Pin", "Sạc nhanh", "Cổng sạc", "Wi-Fi", "Bluetooth", "Mạng di động", "Chất liệu", "Trọng lượng", "Kích thước", "Kháng nước", "Bảo mật", "Hệ điều hành", "Năm ra mắt"};
        String[] specValues = {"Snapdragon / Apple Silicon", "8GB / 16GB", "256GB / 512GB", "Khoảng 6-7 inch", "OLED / AMOLED", "2K / 4K", "120Hz", "4500-5000", "Có hỗ trợ", "Type-C", "Wi-Fi 6E", "Bluetooth 5.3", "5G", "Nhôm / Kính / Titan", "Khoảng 200", "Dài x Rộng x Dày", "IP68", "Face ID / Vân tay", "iOS / Android", "2023 - 2024"};
        String[] specUnits = {"", "", "", "inch", "", "Pixels", "Hz", "mAh", "", "", "", "", "", "", "g", "mm", "", "", "", ""};
        
        // Generate 10 products, 4 colors * 3 sizes = 12 variants each => 120 rows
        for (int i = 0; i < 10; i++) {
            String skuBase = "SP-VIP-" + String.format("%03d", i+1);
            
            for (int s = 0; s < sizes.length; s++) {
                for (int c = 0; c < colors.length; c++) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(skuBase); 
                    row.createCell(1).setCellValue(productNames[i]);
                    row.createCell(2).setCellValue(descs[i]);
                    row.createCell(3).setCellValue((double) basePrices[i]);
                    row.createCell(4).setCellValue(brandIds[i]); 
                    row.createCell(5).setCellValue(catIds[i]); 
                    
                    row.createCell(6).setCellValue(sizes[s]);
                    row.createCell(7).setCellValue(colors[c]);
                    row.createCell(8).setCellValue((double) basePrices[i] + (s * 3000000)); 
                    
                    // Generate 20 Specs
                    for(int specIdx = 0; specIdx < 20; specIdx++) {
                        int baseCol = 9 + (specIdx * 4);
                        row.createCell(baseCol).setCellValue(specGroups[specIdx % 5]); // Group
                        row.createCell(baseCol + 1).setCellValue(specKeys[specIdx]); // Key
                        row.createCell(baseCol + 2).setCellValue(specValues[specIdx]); // Value
                        row.createCell(baseCol + 3).setCellValue(specUnits[specIdx]); // Unit
                    }
                }
            }
        }

        try (FileOutputStream out = new FileOutputStream("e:\\\\e-commerce-microservices-master\\\\e-commerce-microservices-master\\\\Data_San_Pham_Sieu_To.xlsx")) {
            workbook.write(out);
        }
        workbook.close();
    }
}
