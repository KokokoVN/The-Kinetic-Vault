@echo off
cd /d "%~dp0stitch"
node "%~dp0stitch\node_modules\next\dist\bin\next" dev --webpack -p 3000 > "%~dp0logs\frontend-next.log" 2> "%~dp0logs\frontend-next.err.log"
