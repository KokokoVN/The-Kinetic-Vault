@echo off
echo ========================================================
echo Dang build toan bo microservices (bo qua test)...
echo ========================================================

echo 1. Xay dung Eureka Server...
call mvn -f eureka-server\pom.xml clean install -DskipTests -q

echo 2. Xay dung User Service...
call mvn -f user-service\pom.xml clean install -DskipTests -q

echo 3. Xay dung Product Catalog Service...
call mvn -f product-catalog-service\pom.xml clean install -DskipTests -q

echo 4. Xay dung Inventory Service...
call mvn -f inventory-service\pom.xml clean install -DskipTests -q

echo 5. Xay dung Activity Log Service...
call mvn -f activity-log-service\pom.xml clean install -DskipTests -q

echo 6. Xay dung Cart Service...
call mvn -f cart-service\pom.xml clean install -DskipTests -q

echo 7. Xay dung Order Service...
call mvn -f order-service\pom.xml clean install -DskipTests -q

echo 8. Xay dung Sale Service...
call mvn -f sale-service\pom.xml clean install -DskipTests -q

echo 9. Xay dung Payment Service...
call mvn -f payment-service\pom.xml clean install -DskipTests -q

echo 10. Xay dung Notification Service...
call mvn -f notification-service\pom.xml clean install -DskipTests -q

echo 11. Xay dung Recommendation Service...
call mvn -f product-recommendation-service\pom.xml clean install -DskipTests -q

echo 12. Xay dung Review Service...
call mvn -f review-service\pom.xml clean install -DskipTests -q

echo 13. Xay dung Telegram Service...
call mvn -f telegram-service\pom.xml clean install -DskipTests -q

echo 14. Xay dung AI Chatbot Service...
call mvn -f ai-chatbot-service\pom.xml clean install -DskipTests -q

echo 15. Xay dung API Gateway...
call mvn -f api-gateway\pom.xml clean install -DskipTests -q

echo ========================================================
echo HOAN THANH BUILD TAT CA! Bay gio hay chay file chay-nhanh.bat
echo ========================================================
pause
