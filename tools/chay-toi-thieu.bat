@echo off
setlocal
echo ==============================================
echo   KHOI DONG DICH VU COT LOI (TIET KIEM RAM < 4GB)
echo   Danh sach: Eureka -> Core Microservices -> API Gateway
echo ==============================================
echo.

start "Eureka" cmd /k "title Eureka && java -jar eureka-server\target\eureka-server-0.0.1-SNAPSHOT.jar"
echo Dang cho Eureka khoi dong (10 giay)...
timeout /t 10 /nobreak >nul

start "User Service" cmd /k "title User Service && java -jar user-service\target\user-service-0.0.1-SNAPSHOT.jar"
start "Catalog Service" cmd /k "title Catalog Service && java -jar product-catalog-service\target\product-catalog-service-0.0.1-SNAPSHOT.jar"
start "Inventory Service" cmd /k "title Inventory Service && java -jar inventory-service\target\inventory-service-0.0.1-SNAPSHOT.jar"
start "Cart Service" cmd /k "title Cart Service && java -jar cart-service\target\cart-service-0.0.1-SNAPSHOT.jar"
start "Order Service" cmd /k "title Order Service && java -jar order-service\target\order-service-0.0.1-SNAPSHOT.jar"
start "Payment Service" cmd /k "title Payment Service && java -jar payment-service\target\payment-service-0.0.1-SNAPSHOT.jar"

echo Dang cho cac microservices khoi dong (12 giay)...
timeout /t 12 /nobreak >nul

start "API Gateway" cmd /k "title API Gateway && java -jar api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar"

echo ==============================================
echo Da khoi dong xong cac dich vu cot loi!
echo Vui long kiem tra cac cua so de xem log.
echo.
echo ==============================================
echo [ CAN CANH BAO ]
echo NHAN PHIM BAT KY TAI DAY SE DONG VA TAT TOAN BO CAC SERVICES TREN!
echo ==============================================
pause

echo Dang tien hanh tat cac services...
taskkill /FI "WINDOWTITLE eq Eureka*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq User Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Catalog Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Inventory Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Cart Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Order Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Payment Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq API Gateway*" /T /F >nul 2>&1

echo Hoan thanh tat tat ca cac services!
pause
