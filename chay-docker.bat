@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================================
echo   E-COMMERCE MICROSERVICES - TRÌNH ĐIỀU KHIỂN DOCKER
echo ========================================================
echo.
echo Vui lòng chọn chế độ khởi chạy:
echo   [1] CHẠY TOÀN BỘ (Full: 15 Microservices + Frontend + MySQL + Redis)
echo   [2] CHẠY RÚT GỌN (Lite: Core services tiết kiệm RAM)
echo   [3] CHỈ CHẠY HẠ TẦNG (MySQL 8 + Redis 7 để code Java local)
echo   [4] BUILD LẠI TOÀN BỘ (Maven package JAR + Docker build)
echo   [5] DỪNG TOÀN BỘ CONTAINER DOCKER
echo   [0] Thoát
echo.
set /p choice="Nhập lựa chọn của bạn [1-5]: "

if "%choice%"=="1" goto run_full
if "%choice%"=="2" goto run_lite
if "%choice%"=="3" goto run_infra
if "%choice%"=="4" goto build_all
if "%choice%"=="5" goto stop_all
if "%choice%"=="0" goto end
goto invalid

:run_full
echo.
echo ========================================================
echo [1/2] Đang khởi động TOÀN BỘ hệ thống Docker...
echo ========================================================
docker compose up -d --build
goto show_status

:run_lite
echo.
echo ========================================================
echo [1/2] Đang khởi động BẢN RÚT GỌN (Core Services)...
echo ========================================================
docker compose -f docker-compose.lite.yml up -d --build
goto show_status

:run_infra
echo.
echo ========================================================
echo Đang khởi động MySQL 8 & Redis 7...
echo ========================================================
docker compose -f docker-compose.infra.yml up -d
echo.
echo [Thành công] MySQL (port 3306) và Redis (port 6379) đã sẵn sàng!
pause
goto end

:build_all
echo.
echo ========================================================
echo [1/2] Đóng gói các Microservices Java (Maven package)...
echo ========================================================
call mvn clean package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo [Lỗi] Build Maven thất bại! Vui lòng kiểm tra log ở trên.
    pause
    goto end
)
echo.
echo ========================================================
echo [2/2] Build lại các Docker Images...
echo ========================================================
docker compose build
echo.
echo [Thành công] Đã đóng gói xong toàn bộ JAR và Docker Images!
pause
goto end

:stop_all
echo.
echo ========================================================
echo Đang dừng và dọn dẹp các container...
echo ========================================================
docker compose down
docker compose -f docker-compose.lite.yml down
docker compose -f docker-compose.infra.yml down
echo [Thành công] Đã dừng toàn bộ container Docker!
pause
goto end

:show_status
echo.
echo ========================================================
echo   HỆ THỐNG DOCKER ĐANG CHẠY!
echo.
echo   - Frontend Web Client: http://localhost:3000
echo   - API Gateway:         http://localhost:8900
echo   - Eureka Server:       http://localhost:8761
echo   - MySQL Database:      localhost:3306 (root / root)
echo   - Redis:               localhost:6379
echo ========================================================
echo.
echo Để xem trạng thái container, gõ: docker compose ps
echo Để xem log dịch vụ, gõ:         docker compose logs -f [service_name]
echo Để tắt hệ thống, chạy file:     tat-docker.bat
echo ========================================================
pause
goto end

:invalid
echo Lựa chọn không hợp lệ!
pause
goto end

:end
