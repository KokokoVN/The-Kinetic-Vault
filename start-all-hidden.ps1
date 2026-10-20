# start-all-hidden.ps1
# Khoi dong toan bo he thong Microservices va Frontend Next.js Stitch chay ngam hoan toan
# Khong mo bat ky cua so CMD nao tren man hinh

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }
$logsDir = Join-Path $root "logs"
if (-not (Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir -Force | Out-Null }

function Start-HiddenApp {
    param (
        [string]$FilePath,
        [string]$ArgumentList,
        [string]$CurrentDirectory = $root,
        [string]$LogFile = $null,
        [string]$ErrFile = $null
    )
    $params = @{
        FilePath = $FilePath
        WorkingDirectory = $CurrentDirectory
        WindowStyle = "Hidden"
        PassThru = $true
    }
    if ($ArgumentList) { $params.ArgumentList = $ArgumentList }
    if ($LogFile) { $params.RedirectStandardOutput = $LogFile }
    if ($ErrFile) { $params.RedirectStandardError = $ErrFile }

    try {
        $proc = Start-Process @params
        return $proc.Id
    } catch {
        Write-Host "  ! Loi khi khoi chay $FilePath : $_" -ForegroundColor Red
        return $null
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  KHOI DONG TOAN BO MICROSERVICES VA FRONTEND CHAY NGAM   " -ForegroundColor Cyan
Write-Host "  (Hoan toan khong hien bat ky cua so CMD nao)            " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 0. Kiem tra va khoi dong MySQL
$mysqlConn = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue
if (-not $mysqlConn) {
    Write-Host "[0/5] Dang bat MySQL server chay ngam..." -ForegroundColor Yellow
    $mysqlExe = "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqld.exe"
    $mysqlIni = "C:\laragon\bin\mysql\mysql-8.0.30-winx64\my.ini"
    if (Test-Path $mysqlExe) {
        $mPid = Start-HiddenApp -FilePath $mysqlExe -ArgumentList "--defaults-file=`"$mysqlIni`"" -CurrentDirectory "C:\laragon\bin\mysql\mysql-8.0.30-winx64"
        Write-Host "  -> Da bat MySQL server (PID $mPid)" -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
} else {
    Write-Host "[0/5] MySQL server da chay tren port 3306." -ForegroundColor Green
}

# 1. Kiem tra va khoi dong Redis
$redisConn = Get-NetTCPConnection -LocalPort 6379 -ErrorAction SilentlyContinue
if (-not $redisConn) {
    Write-Host "[1/5] Dang bat Redis server chay ngam..." -ForegroundColor Yellow
    $redisExe = "C:\laragon\bin\redis\redis-x64-5.0.14.1\redis-server.exe"
    $redisConf = "C:\laragon\bin\redis\redis-x64-5.0.14.1\redis.windows.conf"
    if (Test-Path $redisExe) {
        $rPid = Start-HiddenApp -FilePath $redisExe -ArgumentList "`"$redisConf`"" -CurrentDirectory "C:\laragon\bin\redis\redis-x64-5.0.14.1" -LogFile (Join-Path $logsDir "redis.log")
        Write-Host "  -> Da bat Redis server (PID $rPid)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
} else {
    Write-Host "[1/5] Redis server da chay tren port 6379." -ForegroundColor Green
}

# 2. Khoi dong Eureka Server
Write-Host "[2/5] Dang khoi dong Eureka Server (Port 8761)..." -ForegroundColor Yellow
$eurekaLog = Join-Path $logsDir "eureka-server.log"
$eurekaErr = Join-Path $logsDir "eureka-server.err.log"
$eurekaPid = Start-HiddenApp -FilePath "java" -ArgumentList "-XX:TieredStopAtLevel=1 -Xms32m -Xmx200m -jar eureka-server\target\eureka-server-0.0.1-SNAPSHOT.jar" -CurrentDirectory $root -LogFile $eurekaLog -ErrFile $eurekaErr
Write-Host "  -> Eureka Server dang khoi dong (PID $eurekaPid)..." -ForegroundColor Gray

# Doi Eureka san sang qua HTTP check
Write-Host "Dang cho Eureka Server khoi dong san sang..." -ForegroundColor Gray
$eurekaReady = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:8761/" -TimeoutSec 1 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($resp -and $resp.StatusCode -eq 200) {
            $eurekaReady = $true
            break
        }
    } catch {}
}
if ($eurekaReady) {
    Write-Host "  -> Eureka Server da san sang tren port 8761!" -ForegroundColor Green
} else {
    Write-Host "  -> Cho Eureka them 5 giay de on dinh..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

# 3. Khoi dong 11 Backend Microservices can thiet (Port 8810 - 8821)
Write-Host "[3/5] Dang khoi dong 11 Backend Microservices can thiet (Port 8810 - 8821)..." -ForegroundColor Yellow
$services = @(
    @{ Name = "product-catalog-service"; Jar = "product-catalog-service\target\product-catalog-service-0.0.1-SNAPSHOT.jar"; Port = 8810 },
    @{ Name = "user-service"; Jar = "user-service\target\user-service-0.0.1-SNAPSHOT.jar"; Port = 8811 },
    @{ Name = "cart-service"; Jar = "cart-service\target\cart-service-0.0.1-SNAPSHOT.jar"; Port = 8821 },
    @{ Name = "inventory-service"; Jar = "inventory-service\target\inventory-service-0.0.1-SNAPSHOT.jar"; Port = 8820 },
    @{ Name = "order-service"; Jar = "order-service\target\order-service-0.0.1-SNAPSHOT.jar"; Port = 8813 },
    @{ Name = "payment-service"; Jar = "payment-service\target\payment-service-0.0.1-SNAPSHOT.jar"; Port = 8814 },
    @{ Name = "sale-service"; Jar = "sale-service\target\sale-service-0.0.1-SNAPSHOT.jar"; Port = 8816 },
    @{ Name = "review-service"; Jar = "review-service\target\review-service-0.0.1-SNAPSHOT.jar"; Port = 8818 },
    @{ Name = "notification-service"; Jar = "notification-service\target\notification-service-0.0.1-SNAPSHOT.jar"; Port = 8815 },
    @{ Name = "activity-log-service"; Jar = "activity-log-service\target\activity-log-service-0.0.1-SNAPSHOT.jar"; Port = 8817 },
    @{ Name = "product-recommendation-service"; Jar = "product-recommendation-service\target\product-recommendation-service-0.0.1-SNAPSHOT.jar"; Port = 8812 }
)

foreach ($s in $services) {
    $logPath = Join-Path $logsDir "$($s.Name).log"
    $errPath = Join-Path $logsDir "$($s.Name).err.log"
    $pidNum = Start-HiddenApp -FilePath "java" -ArgumentList "-XX:TieredStopAtLevel=1 -Xms32m -Xmx220m -jar $($s.Jar)" -CurrentDirectory $root -LogFile $logPath -ErrFile $errPath
    Write-Host "  -> Da bat $($s.Name) (Port $($s.Port), PID $pidNum)" -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

Write-Host "Dang cho cac Microservices dang ky vao Eureka (10 giay)..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# 4. Khoi dong API Gateway
Write-Host "[4/5] Dang khoi dong API Gateway (Port 8900)..." -ForegroundColor Yellow
$gatewayLog = Join-Path $logsDir "api-gateway.log"
$gatewayErr = Join-Path $logsDir "api-gateway.err.log"
$gwPid = Start-HiddenApp -FilePath "java" -ArgumentList "-XX:TieredStopAtLevel=1 -Xms32m -Xmx220m -jar api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar" -CurrentDirectory $root -LogFile $gatewayLog -ErrFile $gatewayErr
Write-Host "  -> Da bat API Gateway tren port 8900 (PID $gwPid)" -ForegroundColor Gray

# 5. Khoi dong Frontend Stitch
Write-Host "[5/5] Dang khoi dong Frontend Next.js Stitch (Port 3000)..." -ForegroundColor Yellow
$frontendLog = Join-Path $logsDir "frontend-stitch.log"
$frontendErr = Join-Path $logsDir "frontend-stitch.err.log"
$stitchDir = Join-Path $root "stitch"
$frontPid = Start-HiddenApp -FilePath "node.exe" -ArgumentList "node_modules\next\dist\bin\next dev --webpack -p 3000" -CurrentDirectory $stitchDir -LogFile $frontendLog -ErrFile $frontendErr
Write-Host "  -> Da bat Frontend Stitch tren port 3000 (PID $frontPid)" -ForegroundColor Gray


Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  TOAN BO HE THONG DA DUOC KHOI DONG CHAY NGAM THANH CONG!" -ForegroundColor Green
Write-Host "  - Frontend Web:  http://localhost:3000                  " -ForegroundColor Green
Write-Host "  - API Gateway:   http://localhost:8900                  " -ForegroundColor Green
Write-Host "  - Eureka Server: http://localhost:8761                  " -ForegroundColor Green
Write-Host "  - Thu muc Logs:  $logsDir                               " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Dang kiem tra tinh trang cac cong..." -ForegroundColor Cyan

$checkPorts = @(3306, 6379, 8761, 8900, 3000, 8810, 8811, 8812, 8813, 8814, 8815, 8816, 8817, 8818, 8820, 8821)
$statusFile = Join-Path $logsDir "system-status.txt"

while ($true) {
    $activePorts = @()
    foreach ($p in $checkPorts) {
        $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
        if ($conn) {
            $activePorts += $p
        }
    }
    $statusText = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] He thong hoat dong binh thuong. Active Ports: $($activePorts -join ', ')"
    Set-Content -Path $statusFile -Value $statusText -Encoding UTF8
    Start-Sleep -Seconds 30
}
