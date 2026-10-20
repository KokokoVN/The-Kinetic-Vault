@echo off
setlocal
title The Kinetic Vault - Backend Tunnel (Cloudflare)
color 0B

echo ===================================================
echo     KHOI TAO DUONG HAM CLOUDFLARE CHO BACKEND
echo ===================================================
echo.

set CLOUDFLARED_BIN=tools\cloudflared.exe
if not exist "%CLOUDFLARED_BIN%" (
    if exist "cloudflared.exe" (
        set CLOUDFLARED_BIN=cloudflared.exe
    )
)

if not exist "%CLOUDFLARED_BIN%" (
    if not exist "tools" mkdir "tools"
    echo [1/3] Dang tai Cloudflared... (Vui long cho vai giay)
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'tools\cloudflared.exe'"
    set CLOUDFLARED_BIN=tools\cloudflared.exe
    if not exist "%CLOUDFLARED_BIN%" (
        echo [Loi] Khong the tai xuong Cloudflared! Kiem tra lai mang.
        pause
        exit /b
    )
) else (
    echo [1/3] Da tim thay Cloudflared tai: %CLOUDFLARED_BIN%
)

echo [2/3] Chuan bi tao duong ham...
echo.
echo ===================================================
echo HUONG DAN:
echo 1. Cho mot lat, man hinh se hien thi ra nhieu dong chu.
echo 2. Ban tim dong chu bat dau bang: "https://..." va ket thuc bang ".trycloudflare.com"
echo 3. Do chinh la DUONG LINK BACKEND cua ban tren Internet!
echo 4. Copy duong link do vao bien moi truong NEXT_PUBLIC_API_URL tren Vercel.
echo ===================================================
echo.
echo [3/3] Dang ket noi vao mang luoi Cloudflare...
echo.

"%CLOUDFLARED_BIN%" tunnel --url http://localhost:8900

pause
