const xlsx = require('xlsx');
const fs = require('fs');

const columns = [
  "SKU", "Tên sản phẩm", "Mô tả", "Giá cơ bản", "Brand ID", "Category ID", "Kích thước (Size)", "Màu sắc (Color)", "Giá biến thể",
  "Nhóm thông số 1", "Tên thông số 1", "Giá trị 1", "Đơn vị 1",
  "Nhóm thông số 2", "Tên thông số 2", "Giá trị 2", "Đơn vị 2",
  "Nhóm thông số 3", "Tên thông số 3", "Giá trị 3", "Đơn vị 3",
  "Nhóm thông số 4", "Tên thông số 4", "Giá trị 4", "Đơn vị 4",
  "Nhóm thông số 5", "Tên thông số 5", "Giá trị 5", "Đơn vị 5"
];

const rows = [
  // Sản phẩm 1 (Có 2 biến thể) - Hợp lệ
  ["SKU_TEST_01", "Áo sơ mi nam Premium", "Áo sơ mi vải chống nhăn", 250000, 1, 1, "M", "Trắng", 250000, "Chất liệu", "Thành phần", "100% Cotton", "", "Xuất xứ", "Sản xuất tại", "Việt Nam", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["SKU_TEST_01", "Áo sơ mi nam Premium", "Áo sơ mi vải chống nhăn", 250000, 1, 1, "L", "Trắng", 250000, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  
  // Sản phẩm 2 (Có 3 biến thể màu sắc & size) - Hợp lệ
  ["SKU_TEST_02", "Quần Jean ống suông", "Quần jean form rộng cá tính", 320000, 1, 2, "29", "Xanh nhạt", 320000, "Kiểu dáng", "Form", "Ống suông rộng", "", "Chất liệu", "Vải", "Denim cao cấp", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["SKU_TEST_02", "Quần Jean ống suông", "Quần jean form rộng cá tính", 320000, 1, 2, "30", "Xanh nhạt", 320000, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["SKU_TEST_02", "Quần Jean ống suông", "Quần jean form rộng cá tính", 320000, 1, 2, "29", "Đen", 320000, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // Sản phẩm 3 (Không có Brand, nhưng hợp lệ nếu không bắt buộc)
  ["SKU_TEST_03", "Balo đi học sinh viên", "Balo nam nữ đựng vừa laptop 15.6 inch", 199000, "", 3, "Free size", "Đen", 199000, "Kích thước", "Laptop", "15.6", "inch", "Chống nước", "Tính năng", "Có", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // Sản phẩm 4 (Lỗi: Cố ý thiếu Tên sản phẩm) - Để test tính năng check lỗi
  ["SKU_TEST_04", "", "Sản phẩm không có tên", 150000, 1, 1, "M", "Xanh", 150000, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // Sản phẩm 5 (Lỗi: Cố ý thiếu giá cơ bản)
  ["SKU_TEST_05", "Áo khoác dù", "Áo khoác dù chống nắng 2 lớp", "", 2, 1, "L", "Đen", 200000, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // Sản phẩm 6 (Hợp lệ)
  ["SKU_TEST_06", "Giày thể thao Running", "Giày chạy bộ cực nhẹ", 550000, 2, 4, "40", "Trắng", 550000, "Đế giày", "Chất liệu", "Cao su nguyên khối", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // Sản phẩm 7 (Hợp lệ)
  ["SKU_TEST_07", "Giày thể thao Running", "Giày chạy bộ cực nhẹ", 550000, 2, 4, "41", "Trắng", 550000, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // Sản phẩm 8 (Hợp lệ)
  ["SKU_TEST_08", "Mũ lưỡi trai Unisex", "Mũ freesize chất kaki", 89000, 1, 5, "Freesize", "Đen", 89000, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  
  // Sản phẩm 9 (Lỗi: Brand ID và Category ID không tồn tại - Giả sử ID 9999 là sai)
  ["SKU_TEST_09", "Áo thun lỗi danh mục", "Test sai ID", 120000, 9999, 9999, "S", "Đỏ", 120000, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // Sản phẩm 10 (Lỗi: Trùng tên sản phẩm của SKU khác - Trùng với SKU_TEST_01)
  ["SKU_TEST_10", "Áo sơ mi nam Premium", "Trùng tên nhưng khác SKU", 250000, 1, 1, "XL", "Trắng", 250000, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
];

const data = [columns, ...rows];

const ws = xlsx.utils.aoa_to_sheet(data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, "Import_San_Pham");

const filePath = '../Sample_Products_For_Bot.xlsx';
xlsx.writeFile(wb, filePath);

console.log('File created at: ' + filePath);
