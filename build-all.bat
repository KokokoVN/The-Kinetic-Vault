@echo off
echo ========================================================
echo   DONG GOI (BUILD) TOAN BO HE THONG - BACKEND & FRONTEND
echo ========================================================

echo.
echo [1/2] DONG GOI BACKEND (Cac service Java Spring Boot)...
echo ========================================================
call mvn clean package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo.
    echo [Loi] Dong goi Backend that bai! Vui long kiem tra loi Maven o tren.
    pause
    exit /b %ERRORLEVEL%
)
echo [Thanh cong] Da build xong Backend!

echo.
echo [2/2] DONG GOI FRONTEND (Next.js)...
echo ========================================================
cd stitch
call npm install
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [Loi] Dong goi Frontend that bai! Vui long kiem tra loi tren.
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..
echo [Thanh cong] Da build xong Frontend!

echo.
echo ========================================================
echo HOAN TAT! Toan bo ma nguon da duoc toi uu va dong goi xong.
echo Bay gio ban co the chay he thong len de su dung.
echo ========================================================
pause
