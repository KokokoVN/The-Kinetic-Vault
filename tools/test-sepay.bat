@echo off
echo ==============================================
echo   CONG CU GIA LAP THANH TOAN SEPAY
echo ==============================================
set /p code="Nhap ma thanh toan tren man hinh (VD: DH15, nhap ca chu DH): "
set /p amount="Nhap so tien can thanh toan (VD: 500000): "

echo Dang gui webhook gia lap den localhost:3000...
curl.exe -X POST "http://localhost:3000/api/payments/sepay/webhook" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: sepay_webhook_9f3a2c1f7e8b4a6c" ^
  -d "{\"code\": \"%code%\", \"transferType\": \"in\", \"transferAmount\": %amount%, \"referenceCode\": \"TEST_LOCAL\"}"

echo.
echo Da gui lenh thanh toan thanh cong! Vui long kiem tra xem man hinh web da tu chuyen trang chua nhe!
pause
