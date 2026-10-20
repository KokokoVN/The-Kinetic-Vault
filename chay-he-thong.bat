@echo off
setlocal
echo ========================================================
echo   HE THONG E-COMMERCE MICROSERVICES + NEXT.JS STITCH
echo   Che do: Tiet kiem RAM (Toi uu JVM heap -Xmx256m)
echo ========================================================
echo.

echo 1. Dang khoi dong Eureka Server (Port 8761)...
start "Eureka" cmd /k "title Eureka && java -Xms64m -Xmx256m -jar eureka-server\target\eureka-server-0.0.1-SNAPSHOT.jar"
echo Dang cho Eureka san sang (10 giay)...
ping 127.0.0.1 -n 11 >nul 2>&1

echo 2. Dang khoi dong cac Microservices cot loi...
start "Product Catalog Service" cmd /k "title Product Catalog Service && java -Xms64m -Xmx256m -jar product-catalog-service\target\product-catalog-service-0.0.1-SNAPSHOT.jar"
start "User Service" cmd /k "title User Service && java -Xms64m -Xmx256m -jar user-service\target\user-service-0.0.1-SNAPSHOT.jar"
start "Product Recommendation Service" cmd /k "title Product Recommendation Service && java -Xms64m -Xmx256m -jar product-recommendation-service\target\product-recommendation-service-0.0.1-SNAPSHOT.jar"
start "Order Service" cmd /k "title Order Service && java -Xms64m -Xmx256m -jar order-service\target\order-service-0.0.1-SNAPSHOT.jar"
start "Payment Service" cmd /k "title Payment Service && java -Xms64m -Xmx256m -jar payment-service\target\payment-service-0.0.1-SNAPSHOT.jar"
start "Notification Service" cmd /k "title Notification Service && java -Xms64m -Xmx256m -jar notification-service\target\notification-service-0.0.1-SNAPSHOT.jar"
start "Sale Service" cmd /k "title Sale Service && java -Xms64m -Xmx256m -jar sale-service\target\sale-service-0.0.1-SNAPSHOT.jar"
start "Activity Log Service" cmd /k "title Activity Log Service && java -Xms64m -Xmx256m -jar activity-log-service\target\activity-log-service-0.0.1-SNAPSHOT.jar"
start "Review Service" cmd /k "title Review Service && java -Xms64m -Xmx256m -jar review-service\target\review-service-0.0.1-SNAPSHOT.jar"
start "Inventory Service" cmd /k "title Inventory Service && java -Xms64m -Xmx256m -jar inventory-service\target\inventory-service-0.0.1-SNAPSHOT.jar"
start "Cart Service" cmd /k "title Cart Service && java -Xms64m -Xmx256m -jar cart-service\target\cart-service-0.0.1-SNAPSHOT.jar"
start "AI Chatbot Service" cmd /k "title AI Chatbot Service && java -Xms64m -Xmx256m -jar ai-chatbot-service\target\ai-chatbot-service-0.0.1-SNAPSHOT.jar"
start "Telegram Service" cmd /k "title Telegram Service && java -Xms64m -Xmx256m -jar telegram-service\target\telegram-service-0.0.1-SNAPSHOT.jar"

echo Dang cho cac Microservices dang ky vao Eureka (12 giay)...
ping 127.0.0.1 -n 13 >nul 2>&1

echo 3. Dang khoi dong API Gateway (Port 8900)...
start "API Gateway" cmd /k "title API Gateway && java -Xms64m -Xmx256m -jar api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar"

echo 4. Dang khoi dong Frontend Next.js Stitch (Port 3000)...
start "Frontend Stitch" cmd /k "title Frontend Stitch && cd stitch && npm run dev"

echo.
echo ========================================================
echo   HE THONG DA KHOI DONG TOAN BO THANH CONG!
echo   - Frontend:    http://localhost:3000
echo   - API Gateway: http://localhost:8900
echo   - Eureka:      http://localhost:8761
echo ========================================================
echo.
echo [Luu y] Khi muon tat toan bo he thong, vui long chay file:
echo         tat-he-thong.bat
echo ========================================================
pause
