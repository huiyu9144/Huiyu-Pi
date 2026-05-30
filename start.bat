@echo off
chcp 65001 >nul
cd /d "%~dp0"

title Huiyu Pi - Dev Server

echo ========================================
echo   Huiyu Pi
echo   API    - http://localhost:9144
echo   Client - http://localhost:9145
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
echo [3/3] Starting servers...
echo.

set PORT=9144

if exist "packages\server\dist\index.js" (
    echo [API] Using pre-built server (fast start^)
    start /B cmd /c "set PORT=9144 && node packages/server/dist/index.js"
) else (
    echo [API] First run: building server...
    call npm run build -w packages/server
    if errorlevel 1 (
        echo [ERROR] Build failed.
        pause
        exit /b 1
    )
    echo [API] Build done.
    start /B cmd /c "set PORT=9144 && node packages/server/dist/index.js"
)

echo Waiting for API server...

:wait_api
timeout /t 1 /nobreak >nul
curl.exe -s -o nul -w "%%{http_code}" http://localhost:9144/api/v1/health 2>nul | findstr "200" >nul
if errorlevel 1 goto wait_api

echo.
echo ========================================
echo   API server ready!
echo   Starting client + browser...
echo ========================================
echo.

start "" http://localhost:9145
call npm run dev -w packages/client
exit /b 0

:create_shortcut
set "SC_NAME=Huiyu Pi"
set "SC_PATH=%USERPROFILE%\Desktop\%SC_NAME%.lnk"
if exist "%SC_PATH%" (
    echo [2/3] Desktop shortcut already exists, skip.
    exit /b 0
)
echo Creating desktop shortcut...
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut('%SC_PATH%'); $sc.TargetPath = '%~dp0start.bat'; $sc.WorkingDirectory = '%~dp0'; $sc.Description = 'Huiyu Pi Dev Server'; $sc.IconLocation = '%~dp0packages\client\public\icons\logo.ico,0'; $sc.Save()"
if exist "%SC_PATH%" (
    echo [2/3] Desktop shortcut created.
) else (
    echo [2/3] Failed to create shortcut, skip.
)
exit /b 0
