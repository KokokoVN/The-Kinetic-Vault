const XLSX = require("xlsx");
const fs = require("fs");

const rows = [];
for (let i = 1; i <= 10; i++) {
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  const code = `TEST-${randomChars}-${i}`;
  
  rows.push({
    "Mã Voucher": code,
    "Mô tả": `Mã test số ${i} (Giảm ${i * 10}K)`,
    "Loại giảm (PERCENT/AMOUNT)": "AMOUNT",
    "Mức giảm": i * 10000,
    "Giảm tối đa": "",
    "Đơn tối thiểu": 100000,
    "Giới hạn toàn HT": 50,
    "Giới hạn/Người": 1,
    "Ngày bắt đầu (YYYY-MM-DDTHH:mm)": "2026-06-25T00:00",
    "Hạn sử dụng (YYYY-MM-DDTHH:mm)": "2026-12-31T23:59",
    "Kích hoạt (TRUE/FALSE)": "TRUE"
  });
}

const ws = XLSX.utils.json_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Voucher");

const outputPath = "E:\\e-commerce-microservices-master\\e-commerce-microservices-master\\stitch\\10_Vouchers_Test.xlsx";
XLSX.writeFile(wb, outputPath);
console.log("Đã tạo file Excel thành công tại: " + outputPath);
