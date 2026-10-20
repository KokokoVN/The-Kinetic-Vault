# stop-all-hidden.ps1
# Tat toan bo he thong Microservices va Frontend an toan

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  DANG TAT TOAN BO HE THONG MICROSERVICES VA FRONTEND... " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Tat theo port thuc te cua he thong
# Eureka: 8761, Gateway: 8900, Frontend: 3000
# Services: 8810-8818, 8820, 8821, 8826, 8092
$targetPorts = @(8761, 8900, 3000, 8810, 8811, 8812, 8813, 8814, 8815, 8816, 8817, 8818, 8820, 8821, 8826, 8092)

foreach ($port in $targetPorts) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conns) {
        $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pidToKill in $pids) {
            Write-Host "  -> Dang giai phong port $port (PID $pidToKill)..." -ForegroundColor Gray
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        }
    }
}

# 2. Tat process Java cua project (khong dong den IDE Java Language Server)
$javaProcs = Get-CimInstance Win32_Process -Filter "name = 'java.exe'" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*eureka-server*" -or
    $_.CommandLine -like "*-service-0.0.1-SNAPSHOT.jar*" -or
    $_.CommandLine -like "*api-gateway*"
}
if ($javaProcs) {
    foreach ($p in $javaProcs) {
        Write-Host "  -> Dang tat Java service PID $($p.ProcessId)..." -ForegroundColor Gray
        Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

# 3. Dong cac cua so cmd/powershell co tieu de cua project neu co
Get-Process cmd, powershell -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*Eureka*" -or
    $_.MainWindowTitle -like "*Service*" -or
    $_.MainWindowTitle -like "*Gateway*" -or
    $_.MainWindowTitle -like "*Stitch*"
} | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  DA TAT TOAN BO HE THONG THANH CONG!                    " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
