@echo off
setlocal
echo ==============================================
echo   QUAN TRONG: Vui long chay lenh sau 1 lan de build cac service truoc khi dung tool nay:
echo   mvn clean install -DskipTests
echo ==============================================
echo.
echo Bat dau khoi dong he thong...

start "Eureka" cmd /k "title Eureka && java -jar eureka-server\target\eureka-server-0.0.1-SNAPSHOT.jar"
echo Dang cho Eureka khoi dong (10 giay)...
timeout /t 10 /nobreak >nul

start "User Service" cmd /k "title User Service && java -jar user-service\target\user-service-0.0.1-SNAPSHOT.jar"
start "Catalog Service" cmd /k "title Catalog Service && java -jar product-catalog-service\target\product-catalog-service-0.0.1-SNAPSHOT.jar"
start "Inventory Service" cmd /k "title Inventory Service && java -jar inventory-service\target\inventory-service-0.0.1-SNAPSHOT.jar"
start "Activity Log" cmd /k "title Activity Log && java -jar activity-log-service\target\activity-log-service-0.0.1-SNAPSHOT.jar"
start "Cart Service" cmd /k "title Cart Service && java -jar cart-service\target\cart-service-0.0.1-SNAPSHOT.jar"
start "Order Service" cmd /k "title Order Service && java -jar order-service\target\order-service-0.0.1-SNAPSHOT.jar"
start "Sale Service" cmd /k "title Sale Service && java -jar sale-service\target\sale-service-0.0.1-SNAPSHOT.jar"
start "Payment Service" cmd /k "title Payment Service && java -jar payment-service\target\payment-service-0.0.1-SNAPSHOT.jar"
start "Notify Service" cmd /k "title Notify Service && java -jar notification-service\target\notification-service-0.0.1-SNAPSHOT.jar"
start "Recommend Service" cmd /k "title Recommend Service && java -jar product-recommendation-service\target\product-recommendation-service-0.0.1-SNAPSHOT.jar"
start "Review Service" cmd /k "title Review Service && java -jar review-service\target\review-service-0.0.1-SNAPSHOT.jar"
start "Telegram Service" cmd /k "title Telegram Service && java -jar telegram-service\target\telegram-service-0.0.1-SNAPSHOT.jar"
start "AI Chatbot" cmd /k "title AI Chatbot && java -jar ai-chatbot-service\target\ai-chatbot-service-0.0.1-SNAPSHOT.jar"

echo Dang cho cac microservices khoi dong (15 giay)...
timeout /t 15 /nobreak >nul

start "API Gateway" cmd /k "title API Gateway && java -jar api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar"

echo ==============================================
echo Da gui lenh khoi dong toan bo cac microservices.
echo Vui long kiem tra cac cua so hien len de xem log tung dich vu.
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
taskkill /FI "WINDOWTITLE eq Activity Log*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Cart Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Order Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Sale Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Payment Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Notify Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Recommend Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Review Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Telegram Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq AI Chatbot*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq API Gateway*" /T /F >nul 2>&1

echo Hoan thanh tat tat ca cac services!
pause
