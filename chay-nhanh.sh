#!/bin/bash
echo "=============================================="
echo "  QUAN TRONG: Vui long chay lenh sau 1 lan de build cac service truoc khi dung tool nay:"
echo "  mvn clean install -DskipTests"
echo "=============================================="
echo ""
echo "Bat dau khoi dong he thong tren Linux (Google Cloud)..."

# Hàm tiện ích để chạy Java app dưới nền (background)
start_service() {
    local name=$1
    local jar_path=$2
    local log_file=$3
    echo "Starting $name..."
    nohup java -jar "$jar_path" > "$log_file" 2>&1 &
    echo "$name started with PID $!"
}

# Tạo thư mục log nếu chưa có
mkdir -p logs

start_service "Eureka" "eureka-server/target/eureka-server-0.0.1-SNAPSHOT.jar" "logs/eureka.log"
echo "Dang cho Eureka khoi dong (15 giay)..."
sleep 15

start_service "User Service" "user-service/target/user-service-0.0.1-SNAPSHOT.jar" "logs/user.log"
start_service "Catalog Service" "product-catalog-service/target/product-catalog-service-0.0.1-SNAPSHOT.jar" "logs/catalog.log"
start_service "Inventory Service" "inventory-service/target/inventory-service-0.0.1-SNAPSHOT.jar" "logs/inventory.log"
start_service "Activity Log" "activity-log-service/target/activity-log-service-0.0.1-SNAPSHOT.jar" "logs/activity.log"
start_service "Cart Service" "cart-service/target/cart-service-0.0.1-SNAPSHOT.jar" "logs/cart.log"
start_service "Order Service" "order-service/target/order-service-0.0.1-SNAPSHOT.jar" "logs/order.log"
start_service "Sale Service" "sale-service/target/sale-service-0.0.1-SNAPSHOT.jar" "logs/sale.log"
start_service "Payment Service" "payment-service/target/payment-service-0.0.1-SNAPSHOT.jar" "logs/payment.log"
start_service "Notify Service" "notification-service/target/notification-service-0.0.1-SNAPSHOT.jar" "logs/notify.log"
start_service "Recommend Service" "product-recommendation-service/target/product-recommendation-service-0.0.1-SNAPSHOT.jar" "logs/recommend.log"
start_service "Review Service" "review-service/target/review-service-0.0.1-SNAPSHOT.jar" "logs/review.log"
start_service "Telegram Service" "telegram-service/target/telegram-service-0.0.1-SNAPSHOT.jar" "logs/telegram.log"
start_service "AI Chatbot" "ai-chatbot-service/target/ai-chatbot-service-0.0.1-SNAPSHOT.jar" "logs/chatbot.log"

echo "Dang cho cac microservices khoi dong (20 giay)..."
sleep 20

start_service "API Gateway" "api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar" "logs/gateway.log"

echo "=============================================="
echo "Da gui lenh khoi dong toan bo cac microservices duoi dang an (Background)."
echo "Log cua tung dich vu duoc luu tai thu muc: logs/"
echo "De dung he thong, hay chay lenh: pkill -f 'java -jar'"
echo "=============================================="
