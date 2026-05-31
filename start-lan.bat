@echo off
chcp 65001 >nul
cd /d "%~dp0"

title Huiyu Pi - LAN Access

REM ===== Detect LAN IP =====
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne '127.0.0.1' } | Select-Object -First 1).IPAddress"') do set LAN_IP=%%i
if "%LAN_IP%"=="" set LAN_IP=127.0.0.1

echo ========================================
echo   Huiyu Pi - LAN Access
echo.
echo   Local:
echo     http://localhost:9144
echo.
echo   LAN (other devices):
echo     http://%LAN_IP%:9144
echo ========================================
echo.

if not exist "node_modules\" (
    echo [1/3] First run - installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    echo [1/3] Done.
) else (
    echo [1/3] Dependencies already installed, skip.
)

echo.
echo [2/3] Checking desktop shortcut...
call :create_shortcut

echo.
echo [3/3] Cleaning up stale processes...
call :cleanup_ports

echo.
echo [4/3] Starting server...
echo.

set HOST=0.0.0.0
set PORT=9144

if exist "packages\server\dist\index.js" (
    echo [API] Using pre-built server (fast start)
) else (
    echo [API] First run: building server...
    call npm run build -w packages/server
    if errorlevel 1 (
        echo [ERROR] Build failed.
        pause
        exit /b 1
    )
    echo [API] Build done.
)

start /B node packages/server/dist/index.js

echo Waiting for API server...

:wait_api
timeout /t 1 /nobreak >nul
curl.exe -s -o nul -w "%%{http_code}" http://localhost:9144/api/v1/health 2>nul | findstr "200" >nul
if errorlevel 1 goto wait_api

echo.
echo ========================================
echo   Server ready!
echo   LAN: http://%LAN_IP%:9144
echo   Opening browser...
echo   Close this window to stop the server.
echo ========================================
echo.

start "" http://%LAN_IP%:9144

:: Block until the server process exits or the console window is closed.
:: When the window is closed, PowerShell terminates and cleanup runs.
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":9144 " ^| findstr "LISTENING" 2^>nul') do set SERVER_PID=%%a
if defined SERVER_PID (
    powershell -NoProfile -Command "try { Wait-Process -Id %SERVER_PID% -ErrorAction Stop } catch {}" 2>nul
    taskkill /F /PID %SERVER_PID% 2>nul
)

exit /b 0

:cleanup_ports
for %%p in (9144 9145) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p " ^| findstr "LISTENING" 2^>nul') do (
        echo [Cleanup] Killing stale process on port %%p (PID=%%a)
        taskkill /PID %%a /F >nul 2>&1
    )
)
exit /b 0

:create_shortcut
set "SC_NAME=Huiyu Pi - LAN"
set "SC_PATH=%USERPROFILE%\Desktop\%SC_NAME%.lnk"
if exist "%SC_PATH%" (
    echo [2/3] Desktop shortcut already exists, skip.
    exit /b 0
)
echo Creating desktop shortcut...
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut('%SC_PATH%'); $sc.TargetPath = '%~dp0start-lan.bat'; $sc.WorkingDirectory = '%~dp0'; $sc.Description = 'Huiyu Pi LAN Access'; $sc.IconLocation = '%~dp0packages\client\public\icons\logo.ico,0'; $sc.Save()"
if exist "%SC_PATH%" (
    echo [2/3] Desktop shortcut created.
) else (
    echo [2/3] Failed to create shortcut, skip.
)
exit /b 0
