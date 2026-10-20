@echo off
chcp 65001 >nul
echo ========================================================
echo   DỪNG VÀ DỌN DẸP HỆ THỐNG DOCKER E-COMMERCE
echo ========================================================
echo.
docker compose down
docker compose -f docker-compose.lite.yml down
docker compose -f docker-compose.infra.yml down
echo.
echo ========================================================
echo [Thành công] Đã dừng toàn bộ dịch vụ Docker.
echo ========================================================
pause
