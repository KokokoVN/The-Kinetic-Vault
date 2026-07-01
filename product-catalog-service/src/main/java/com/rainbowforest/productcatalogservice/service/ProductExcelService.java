package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.dto.ProductExcelRowDto;
import com.rainbowforest.productcatalogservice.entity.Brand;
import com.rainbowforest.productcatalogservice.entity.Category;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.entity.ProductVariant;
import com.rainbowforest.productcatalogservice.repository.BrandRepository;
import com.rainbowforest.productcatalogservice.repository.CategoryRepository;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import com.rainbowforest.productcatalogservice.repository.ProductTechnicalSpecRepository;
import com.rainbowforest.productcatalogservice.repository.ProductVariantRepository;
import com.rainbowforest.productcatalogservice.entity.ProductTechnicalSpec;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;

@Service
public class ProductExcelService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductTechnicalSpecRepository productTechnicalSpecRepository;

    public ProductExcelService(ProductRepository productRepository,
                               ProductVariantRepository productVariantRepository,
                               BrandRepository brandRepository,
                               CategoryRepository categoryRepository,
                               ProductTechnicalSpecRepository productTechnicalSpecRepository) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.productTechnicalSpecRepository = productTechnicalSpecRepository;
    }

    public byte[] generateTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
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
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                CellStyle style = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            // Example row
            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue("SKU001");
            exampleRow.createCell(1).setCellValue("Áo thun T-Shirt");
            exampleRow.createCell(2).setCellValue("Áo thun cotton mát mẻ");
            exampleRow.createCell(3).setCellValue(150000);
            exampleRow.createCell(4).setCellValue(1);
            exampleRow.createCell(5).setCellValue(2);
            exampleRow.createCell(6).setCellValue("M");
            exampleRow.createCell(7).setCellValue("Đỏ");
            exampleRow.createCell(8).setCellValue(150000);
            
            // Spec 1
            exampleRow.createCell(9).setCellValue("Chất liệu");
            exampleRow.createCell(10).setCellValue("Thành phần");
            exampleRow.createCell(11).setCellValue("100% Cotton");
            exampleRow.createCell(12).setCellValue("");

            // Spec 2
            exampleRow.createCell(13).setCellValue("Xuất xứ");
            exampleRow.createCell(14).setCellValue("Nơi sản xuất");
            exampleRow.createCell(15).setCellValue("Việt Nam");
            exampleRow.createCell(16).setCellValue("");

            // Removed autoSizeColumn to prevent timeout

            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                workbook.write(out);
                return out.toByteArray();
            }
        }
    }

    public byte[] generateInventoryTemplate(com.rainbowforest.productcatalogservice.dto.InventoryTemplateRequestDto request) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Template_Nhap_Kho");

            Row headerRow = sheet.createRow(0);
            String[] columns = {
                "Mã SP (Product ID)",
                "Tên Sản phẩm",
                "Mã Biến thể (Variant ID)",
                "Thuộc tính Biến thể (Màu / Size)",
                "Số lượng Nhập/Xuất",
                "Đơn giá (VND)",
                "Ghi chú"
            };

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            
            List<Long> productIds = request.getProductIds() != null ? request.getProductIds() : new ArrayList<>();
            List<Long> variantIds = request.getVariantIds() != null ? request.getVariantIds() : new ArrayList<>();
            
            // Collect all unique productIds to fetch
            Set<Long> allProductIds = new HashSet<>(productIds);
            
            // We need to find products for variantIds as well to avoid N+1 if possible,
            // But variant is fetched by productId anyway. 
            // Let's just fetch variants by variantIds and get their products?
            // Since variants are child of products, it's easier to fetch all products in `productIds`, 
            // plus fetch variants in `variantIds` and get their products.
            
            List<ProductVariant> selectedVariants = new ArrayList<>();
            if (!variantIds.isEmpty()) {
                selectedVariants = productVariantRepository.findAllById(variantIds);
                for (ProductVariant v : selectedVariants) {
                    if (v.getProduct() != null) {
                        allProductIds.add(v.getProduct().getId());
                    }
                }
            }

            List<Product> products = productRepository.findAllById(allProductIds);
            
            for (Product p : products) {
                List<ProductVariant> variants = productVariantRepository.findByProduct_IdOrderByIdAsc(p.getId());
                
                boolean hasOutputRow = false;
                
                if (variants != null && !variants.isEmpty()) {
                    boolean hasSpecificVariantsSelected = false;
                    for (ProductVariant pv : variants) {
                        if (variantIds.contains(pv.getId())) {
                            hasSpecificVariantsSelected = true;
                            break;
                        }
                    }

                    for (ProductVariant v : variants) {
                        boolean shouldInclude = variantIds.contains(v.getId()) || (productIds.contains(p.getId()) && !hasSpecificVariantsSelected);
                        
                        if (shouldInclude) {
                            Row row = sheet.createRow(rowIdx++);
                            row.createCell(0).setCellValue(p.getId());
                            row.createCell(1).setCellValue(p.getProductName() != null ? p.getProductName() : "");
                            row.createCell(2).setCellValue(v.getId());
                            
                            String variantDetails = "";
                            if (v.getColor() != null && !v.getColor().trim().isEmpty()) {
                                variantDetails += "Màu: " + v.getColor() + " ";
                            }
                            if (v.getSize() != null && !v.getSize().trim().isEmpty()) {
                                variantDetails += "- Size: " + v.getSize();
                            }
                            row.createCell(3).setCellValue(variantDetails.trim());
                            
                            // Không điền số lượng vì nhập kho thường nhập SL mới
                            // row.createCell(4).setCellValue(""); 
                            
                            // Điền Đơn giá từ giá của biến thể hoặc giá sản phẩm
                            if (v.getPrice() != null) {
                                row.createCell(5).setCellValue(v.getPrice().doubleValue());
                            } else if (p.getPrice() != null) {
                                row.createCell(5).setCellValue(p.getPrice().doubleValue());
                            }
                            
                            hasOutputRow = true;
                        }
                    }
                } 
                
                // If it's a product without variants, and it's in productIds
                if (!hasOutputRow && productIds.contains(p.getId())) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(p.getId());
                    row.createCell(1).setCellValue(p.getProductName() != null ? p.getProductName() : "");
                    
                    if (p.getPrice() != null) {
                        row.createCell(5).setCellValue(p.getPrice().doubleValue());
                    }
                }
            }

            // Removed autoSizeColumn to prevent timeout

            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                workbook.write(out);
                return out.toByteArray();
            }
        }
    }

    public List<ProductExcelRowDto> previewExcel(MultipartFile file) throws IOException {
        List<ProductExcelRowDto> rows = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || row.getCell(0) == null) continue;

                ProductExcelRowDto dto = new ProductExcelRowDto();
                dto.setRowId(i);
                
                try {
                    dto.setSku(getCellValueAsString(row.getCell(0)));
                    dto.setProductName(getCellValueAsString(row.getCell(1)));
                    dto.setDescription(getCellValueAsString(row.getCell(2)));
                    
                    if (row.getCell(3) != null) {
                        dto.setPrice(getCellValueAsBigDecimal(row.getCell(3)));
                    }
                    
                    if (row.getCell(4) != null) {
                        Long bId = getCellValueAsLong(row.getCell(4));
                        dto.setBrandId(bId);
                        if (bId != null) {
                            brandRepository.findById(bId).ifPresent(b -> dto.setBrandName(b.getName()));
                            if (dto.getBrandName() == null) {
                                dto.addError("Thương hiệu ID " + bId + " không tồn tại");
                            }
                        }
                    }

                    if (row.getCell(5) != null) {
                        Long cId = getCellValueAsLong(row.getCell(5));
                        dto.setCategoryId(cId);
                        if (cId != null) {
                            categoryRepository.findById(cId).ifPresent(c -> dto.setCategoryName(c.getName()));
                            if (dto.getCategoryName() == null) {
                                dto.addError("Danh mục ID " + cId + " không tồn tại");
                            }
                        }
                    }

                    dto.setSize(getCellValueAsString(row.getCell(6)));
                    dto.setColor(getCellValueAsString(row.getCell(7)));
                    
                    if (row.getCell(8) != null) {
                        dto.setVariantPrice(getCellValueAsBigDecimal(row.getCell(8)));
                    }

                    if (dto.getSku() == null || dto.getSku().trim().isEmpty()) {
                        dto.addError("SKU không được để trống");
                    } else if (productRepository.existsBySku(dto.getSku().trim())) {
                        dto.addError("SKU đã tồn tại trong hệ thống");
                    }

                    if (dto.getProductName() == null || dto.getProductName().trim().isEmpty()) {
                        dto.addError("Tên sản phẩm không được để trống");
                    } else {
                        // DB check
                        List<Product> existingByName = productRepository.findAllByProductName(dto.getProductName().trim());
                        for (Product p : existingByName) {
                            if (!p.getSku().equalsIgnoreCase(dto.getSku())) {
                                dto.addError("Tên sản phẩm đã được sử dụng bởi SKU khác (" + p.getSku() + ")");
                                break;
                            }
                        }
                    }
                    if (dto.getPrice() == null) {
                        dto.addError("Giá cơ bản không được để trống");
                    }

                    for (int s = 0; s < 5; s++) {
                        int baseIdx = 9 + (s * 4);
                        String g = getCellValueAsString(row.getCell(baseIdx));
                        String k = getCellValueAsString(row.getCell(baseIdx + 1));
                        String v = getCellValueAsString(row.getCell(baseIdx + 2));
                        String u = getCellValueAsString(row.getCell(baseIdx + 3));
                        
                        if (k != null && !k.trim().isEmpty() && v != null && !v.trim().isEmpty()) {
                            ProductExcelRowDto.SpecExcelDto spec = new ProductExcelRowDto.SpecExcelDto();
                            spec.setGroup(g != null ? g.trim() : null);
                            spec.setKey(k.trim());
                            spec.setValue(v.trim());
                            spec.setUnit(u != null ? u.trim() : null);
                            dto.getSpecs().add(spec);
                        }
                    }

                } catch (Exception e) {
                    dto.addError("Lỗi đọc dữ liệu: " + e.getMessage());
                }
                rows.add(dto);
            }
            
            // File-level duplicate check
            Map<String, Set<String>> nameToSkus = new HashMap<>();
            for (ProductExcelRowDto rowDto : rows) {
                if (rowDto.getProductName() != null && !rowDto.getProductName().trim().isEmpty() && rowDto.getSku() != null) {
                    nameToSkus.computeIfAbsent(rowDto.getProductName().trim().toLowerCase(), k -> new HashSet<>()).add(rowDto.getSku());
                }
            }
            for (ProductExcelRowDto rowDto : rows) {
                if (rowDto.getProductName() != null && !rowDto.getProductName().trim().isEmpty()) {
                    Set<String> skus = nameToSkus.get(rowDto.getProductName().trim().toLowerCase());
                    if (skus != null && skus.size() > 1) {
                        rowDto.addError("Tên sản phẩm bị trùng lặp giữa nhiều SKU trong file");
                    }
                }
            }
            
        }
        return rows;
    }

    public Map<String, Object> confirmImport(List<ProductExcelRowDto> rows, String username, String userId) {
        int successCount = 0;
        List<String> errors = new ArrayList<>();

        // Group rows by SKU
        Map<String, List<ProductExcelRowDto>> bySku = new LinkedHashMap<>();
        for (ProductExcelRowDto row : rows) {
            if (!row.isValid()) {
                errors.add("Dòng " + row.getRowId() + " không hợp lệ, bị bỏ qua");
                continue;
            }
            bySku.computeIfAbsent(row.getSku(), k -> new ArrayList<>()).add(row);
        }

        for (Map.Entry<String, List<ProductExcelRowDto>> entry : bySku.entrySet()) {
            String sku = entry.getKey();
            List<ProductExcelRowDto> productRows = entry.getValue();
            ProductExcelRowDto mainRow = productRows.get(0); // Take first row for main product info

            try {
                Product product = productRepository.findBySku(sku).orElse(new Product());
                product.setSku(sku);
                product.setProductName(mainRow.getProductName());
                product.setDiscription(mainRow.getDescription());
                product.setPrice(mainRow.getPrice());
                
                if (mainRow.getBrandId() != null) {
                    Brand brand = new Brand();
                    brand.setId(mainRow.getBrandId());
                    product.setBrand(brand);
                }
                
                if (mainRow.getCategoryId() != null) {
                    Category cat = new Category();
                    cat.setId(mainRow.getCategoryId());
                    product.setCategoryEntity(cat);
                    product.setCategories(Collections.singletonList(cat));
                }
                
                if (product.getId() == null) {
                    product.setAvailability(0);
                    product.setViewCount(0L);
                    product.setSalesCount(0L);
                    product.setHidden(false);
                }

                Product savedProduct = productRepository.save(product);

                // Save variants
                for (ProductExcelRowDto vRow : productRows) {
                    if (vRow.getSize() != null && !vRow.getSize().trim().isEmpty() &&
                        vRow.getColor() != null && !vRow.getColor().trim().isEmpty()) {
                        
                        ProductVariant variant = productVariantRepository.findByProduct_IdAndSizeIgnoreCaseAndColorIgnoreCase(
                                savedProduct.getId(), vRow.getSize(), vRow.getColor()).orElse(new ProductVariant());
                        
                        variant.setProduct(savedProduct);
                        variant.setSize(vRow.getSize());
                        variant.setColor(vRow.getColor());
                        if (vRow.getVariantPrice() != null) {
                            variant.setPrice(vRow.getVariantPrice());
                        } else {
                            variant.setPrice(savedProduct.getPrice());
                        }
                        productVariantRepository.save(variant);
                    }
                }
                
                // Process Specs
                if (!mainRow.getSpecs().isEmpty()) {
                    List<ProductTechnicalSpec> existingSpecs = productTechnicalSpecRepository.findByProduct_IdOrderBySortOrderAscIdAsc(savedProduct.getId());
                    if (!existingSpecs.isEmpty()) {
                        productTechnicalSpecRepository.deleteAll(existingSpecs);
                    }
                    
                    int sortOrder = 0;
                    for (ProductExcelRowDto.SpecExcelDto s : mainRow.getSpecs()) {
                        ProductTechnicalSpec specEntity = new ProductTechnicalSpec();
                        specEntity.setProduct(savedProduct);
                        specEntity.setSpecGroup(s.getGroup());
                        specEntity.setSpecKey(s.getKey());
                        specEntity.setSpecValue(s.getValue());
                        specEntity.setUnit(s.getUnit());
                        specEntity.setSortOrder(sortOrder++);
                        productTechnicalSpecRepository.save(specEntity);
                    }
                }

                successCount += productRows.size();
            } catch (Exception e) {
                e.printStackTrace();
                String errorMsg = e.getMessage() != null ? e.getMessage() : e.toString();
                errors.add("Lỗi khi lưu SKU " + sku + ": " + errorMsg);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("errors", errors);
        return result;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue();
        if (cell.getCellType() == CellType.NUMERIC) return String.valueOf((long) cell.getNumericCellValue());
        return null;
    }

    private Long getCellValueAsLong(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) return (long) cell.getNumericCellValue();
        if (cell.getCellType() == CellType.STRING) {
            String val = cell.getStringCellValue().trim();
            if (val.isEmpty()) return null;
            return Long.parseLong(val);
        }
        return null;
    }

    private BigDecimal getCellValueAsBigDecimal(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) return BigDecimal.valueOf(cell.getNumericCellValue());
        if (cell.getCellType() == CellType.STRING) {
            String val = cell.getStringCellValue().trim();
            if (val.isEmpty()) return null;
            return new BigDecimal(val);
        }
        return null;
    }
    public byte[] generateErrorExcel(List<ProductExcelRowDto> rows) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Import_Errors");

            Row headerRow = sheet.createRow(0);
            List<String> columnsList = new ArrayList<>(Arrays.asList("SKU", "Tên sản phẩm", "Mô tả", "Giá cơ bản", "Brand ID", "Category ID", "Kích thước (Size)", "Màu sắc (Color)", "Giá biến thể"));
            for (int i = 1; i <= 5; i++) {
                columnsList.add("Nhóm thông số " + i);
                columnsList.add("Tên thông số " + i);
                columnsList.add("Giá trị " + i);
                columnsList.add("Đơn vị " + i);
            }
            columnsList.add("Ghi chú Lỗi"); // Extra column for errors
            
            String[] columns = columnsList.toArray(new String[0]);

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (ProductExcelRowDto rowDto : rows) {
                // Only include invalid rows, or all rows with error column empty for valid ones?
                // The requirement is to output the file with errors. We can output ALL rows, or just invalid.
                // Let's output ALL rows, but mark errors.
                
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(rowDto.getSku() != null ? rowDto.getSku() : "");
                row.createCell(1).setCellValue(rowDto.getProductName() != null ? rowDto.getProductName() : "");
                row.createCell(2).setCellValue(rowDto.getDescription() != null ? rowDto.getDescription() : "");
                if (rowDto.getPrice() != null) row.createCell(3).setCellValue(rowDto.getPrice().doubleValue());
                if (rowDto.getBrandId() != null) row.createCell(4).setCellValue(rowDto.getBrandId());
                if (rowDto.getCategoryId() != null) row.createCell(5).setCellValue(rowDto.getCategoryId());
                row.createCell(6).setCellValue(rowDto.getSize() != null ? rowDto.getSize() : "");
                row.createCell(7).setCellValue(rowDto.getColor() != null ? rowDto.getColor() : "");
                if (rowDto.getVariantPrice() != null) row.createCell(8).setCellValue(rowDto.getVariantPrice().doubleValue());

                int specStartCol = 9;
                if (rowDto.getSpecs() != null) {
                    for (int i = 0; i < Math.min(rowDto.getSpecs().size(), 5); i++) {
                        ProductExcelRowDto.SpecExcelDto spec = rowDto.getSpecs().get(i);
                        int baseCol = specStartCol + (i * 4);
                        row.createCell(baseCol).setCellValue(spec.getGroup() != null ? spec.getGroup() : "");
                        row.createCell(baseCol + 1).setCellValue(spec.getKey() != null ? spec.getKey() : "");
                        row.createCell(baseCol + 2).setCellValue(spec.getValue() != null ? spec.getValue() : "");
                        row.createCell(baseCol + 3).setCellValue(spec.getUnit() != null ? spec.getUnit() : "");
                    }
                }

                // Error column
                String errorMsg = rowDto.isValid() ? "Hợp lệ" : String.join(" | ", rowDto.getErrorMessages());
                row.createCell(columns.length - 1).setCellValue(errorMsg);
            }

            // Removed autoSizeColumn to prevent timeout during Feign call

            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                workbook.write(out);
                return out.toByteArray();
            }
        }
    }
}
