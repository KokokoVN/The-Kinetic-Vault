const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

function generateSampleExcel() {
  const data = [
    // Header
    [
      "SKU", "Tên sản phẩm", "Mô tả", "Giá cơ bản", "Brand ID", "Category ID", "Kích thước (Size)", "Màu sắc (Color)", "Giá biến thể",
      "Nhóm thông số 1", "Tên thông số 1", "Giá trị 1", "Đơn vị 1",
      "Nhóm thông số 2", "Tên thông số 2", "Giá trị 2", "Đơn vị 2",
      "Nhóm thông số 3", "Tên thông số 3", "Giá trị 3", "Đơn vị 3",
      "Nhóm thông số 4", "Tên thông số 4", "Giá trị 4", "Đơn vị 4",
      "Nhóm thông số 5", "Tên thông số 5", "Giá trị 5", "Đơn vị 5"
    ],
    // Dòng 1: Laptop Dell - Variant 1
    [
      "SKU-LAP-001", "Laptop Dell XPS 13", "Laptop doanh nhân cao cấp mỏng nhẹ", 25000000, 1, 1, "RAM 8GB / 256GB SSD", "Đen", 25000000,
      "Cấu hình", "CPU", "Intel Core i5-1240P", "",
      "Cấu hình", "RAM", "8", "GB",
      "Màn hình", "Kích thước", "13.4", "inch",
      "Màn hình", "Độ phân giải", "FHD+", "",
      "", "", "", ""
    ],
    // Dòng 2: Laptop Dell - Variant 2
    [
      "SKU-LAP-001", "Laptop Dell XPS 13", "Laptop doanh nhân cao cấp mỏng nhẹ", 25000000, 1, 1, "RAM 16GB / 512GB SSD", "Bạc", 30000000,
      "Cấu hình", "CPU", "Intel Core i7-1260P", "",
      "Cấu hình", "RAM", "16", "GB",
      "Màn hình", "Kích thước", "13.4", "inch",
      "Màn hình", "Độ phân giải", "4K", "",
      "", "", "", ""
    ],
    // Dòng 3: Điện thoại iPhone - Variant 1
    [
      "SKU-PHO-001", "Điện thoại iPhone 14 Pro Max", "Flagship cao cấp của Apple", 28000000, 2, 2, "128GB", "Tím", 28000000,
      "Hiển thị", "Công nghệ màn hình", "Super Retina XDR OLED", "",
      "Hiển thị", "Tần số quét", "120", "Hz",
      "Camera", "Độ phân giải Camera chính", "48", "MP",
      "Pin", "Dung lượng pin", "4323", "mAh",
      "", "", "", ""
    ],
    // Dòng 4: Điện thoại iPhone - Variant 2
    [
      "SKU-PHO-001", "Điện thoại iPhone 14 Pro Max", "Flagship cao cấp của Apple", 28000000, 2, 2, "256GB", "Đen", 31000000,
      "Hiển thị", "Công nghệ màn hình", "Super Retina XDR OLED", "",
      "Hiển thị", "Tần số quét", "120", "Hz",
      "Camera", "Độ phân giải Camera chính", "48", "MP",
      "Pin", "Dung lượng pin", "4323", "mAh",
      "", "", "", ""
    ],
    // Dòng 5: Samsung Galaxy S23 Ultra - Variant 1
    [
      "SKU-PHO-002", "Samsung Galaxy S23 Ultra", "Điện thoại cao cấp có bút S-Pen", 26000000, 3, 2, "256GB", "Xanh rêu", 26000000,
      "Hiển thị", "Công nghệ màn hình", "Dynamic AMOLED 2X", "",
      "Camera", "Độ phân giải Camera chính", "200", "MP",
      "Cấu hình", "Chip", "Snapdragon 8 Gen 2", "",
      "", "", "", "",
      "", "", "", ""
    ],
    // Dòng 6: Samsung Galaxy S23 Ultra - Variant 2
    [
      "SKU-PHO-002", "Samsung Galaxy S23 Ultra", "Điện thoại cao cấp có bút S-Pen", 26000000, 3, 2, "512GB", "Đen", 29000000,
      "Hiển thị", "Công nghệ màn hình", "Dynamic AMOLED 2X", "",
      "Camera", "Độ phân giải Camera chính", "200", "MP",
      "Cấu hình", "Chip", "Snapdragon 8 Gen 2", "",
      "", "", "", "",
      "", "", "", ""
    ],
    // Dòng 7: Tai nghe Sony - Variant 1
    [
      "SKU-AUD-001", "Tai nghe Sony WH-1000XM5", "Tai nghe chống ồn chủ động over-ear", 7500000, 4, 3, "Free Size", "Đen", 7500000,
      "Âm thanh", "Công nghệ âm thanh", "Chống ồn ANC", "",
      "Âm thanh", "Kích thước màng loa", "30", "mm",
      "Kết nối", "Bluetooth", "5.2", "",
      "", "", "", "",
      "", "", "", ""
    ],
    // Dòng 8: Tai nghe Sony - Variant 2
    [
      "SKU-AUD-001", "Tai nghe Sony WH-1000XM5", "Tai nghe chống ồn chủ động over-ear", 7500000, 4, 3, "Free Size", "Bạc", 7500000,
      "Âm thanh", "Công nghệ âm thanh", "Chống ồn ANC", "",
      "Âm thanh", "Kích thước màng loa", "30", "mm",
      "Kết nối", "Bluetooth", "5.2", "",
      "", "", "", "",
      "", "", "", ""
    ],
    // Dòng 9: Màn hình LG - Variant 1
    [
      "SKU-MON-001", "Màn hình LG 27UP850N", "Màn hình 4K HDR USB-C", 9000000, 5, 4, "27 inch", "Trắng", 9000000,
      "Hiển thị", "Kích thước", "27", "inch",
      "Hiển thị", "Tấm nền", "IPS", "",
      "Kết nối", "Cổng kết nối", "USB-C, HDMI, DP", "",
      "Kết nối", "Công suất sạc Type-C", "90", "W",
      "", "", "", ""
    ],
    // Dòng 10: Màn hình LG - Variant 2
    [
      "SKU-MON-001", "Màn hình LG 27UP850N", "Màn hình 4K HDR USB-C", 9000000, 5, 4, "27 inch", "Đen", 9000000,
      "Hiển thị", "Kích thước", "27", "inch",
      "Hiển thị", "Tấm nền", "IPS", "",
      "Kết nối", "Cổng kết nối", "USB-C, HDMI, DP", "",
      "Kết nối", "Công suất sạc Type-C", "90", "W",
      "", "", "", ""
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Import_San_Pham");

  const outDir = path.join(__dirname, "../public");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, "sample_import.xlsx");
  XLSX.writeFile(wb, outFile);
  console.log("File saved to", outFile);
}

generateSampleExcel();
