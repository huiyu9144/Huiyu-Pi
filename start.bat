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

REM 新用户 clone 下来时 dist 目录是空的（.gitignore 已忽略 dist/），
REM server 起来后 9144 会因为没有 client dist 而返回空白页。
REM 这里强制走一次 build：dist 已存在则秒跳过；不存在则生成全新产物，
REM PWA 的 SW 内容哈希也是这次 build 产出的，跟开发者本地缓存完全无关。
if exist "packages\client\dist\index.html" (
    echo [Client] Using pre-built client (fast start^)
) else (
    echo [Client] First run: building client...
    call npm run build -w packages/client
    if errorlevel 1 (
        echo [ERROR] Client build failed.
        pause
        exit /b 1
    )
    echo [Client] Build done.
)

echo.
echo ========================================
echo   Server starting...
echo   Close this window to stop the server.
echo ========================================
echo.

start "" http://localhost:9144

node packages/server/dist/index.js

echo.
echo Server stopped.
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
