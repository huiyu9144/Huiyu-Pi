@echo off
chcp 65001 >nul
cd /d "%~dp0"

title Huiyu Pi

echo ========================================
echo   Huiyu Pi
echo   http://localhost:9144
echo ========================================
echo.

if not exist "node_modules\" (
    echo [1/4] First run - installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    echo [1/4] Done.
) else (
    echo [1/4] Dependencies already installed, skip.
)

echo.
echo [2/4] Checking desktop shortcut...
call :create_shortcut

echo.
echo [3/4] Cleaning up stale processes...
call :cleanup_ports

echo.
echo [4/4] Starting server...
echo.

set PORT=9144

if exist "packages\server\dist\index.js" (
    echo [API] Using pre-built server (fast start^)
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
echo   Opening http://localhost:9144 ...
echo   Close this window to stop the server.
echo ========================================
echo.

start "" http://localhost:9144

:: Block until the server process exits or the console window is closed.
:: Wait-Process keeps PowerShell alive in this console. When the window
:: is closed (CTRL_CLOSE_EVENT), PowerShell terminates and cleanup runs
:: below ¡ª which force-kills the child server process so it can't
:: linger and serve stale code.
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
set "SC_NAME=Huiyu Pi"
set "SC_PATH=%USERPROFILE%\Desktop\%SC_NAME%.lnk"
if exist "%SC_PATH%" (
    echo [2/4] Desktop shortcut already exists, skip.
    exit /b 0
)
echo Creating desktop shortcut...
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut('%SC_PATH%'); $sc.TargetPath = '%~dp0start.bat'; $sc.WorkingDirectory = '%~dp0'; $sc.Description = 'Huiyu Pi'; $sc.IconLocation = '%~dp0packages\client\public\icons\logo.ico,0'; $sc.Save()"
if exist "%SC_PATH%" (
    echo [2/4] Desktop shortcut created.
) else (
    echo [2/4] Failed to create shortcut, skip.
)
exit /b 0
