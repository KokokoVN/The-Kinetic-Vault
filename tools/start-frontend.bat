@echo off
cd /d "e:\e-commerce-microservices-master\e-commerce-microservices-master\stitch"
start /b "" "C:\Program Files\nodejs\node.exe" node_modules\next\dist\bin\next dev --webpack -p 3000 > "..\logs\frontend-stitch.log" 2> "..\logs\frontend-stitch.err.log"
