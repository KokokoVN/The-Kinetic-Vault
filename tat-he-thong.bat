@echo off
chcp 65001 >nul
echo ========================================================
echo   DANG TAT TOAN BO HE THONG MICROSERVICES VA FRONTEND...
echo ========================================================

powershell -ExecutionPolicy Bypass -File "%~dp0stop-all-hidden.ps1"

pause
