@echo off
chcp 65001 >nul
cd /d "%~dp0"

title pi-forge - Dev Server

echo ========================================
echo   pi-forge
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
set "SHORTCUT_NAME=pi-forge"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\%SHORTCUT_NAME%.lnk"
if not exist "%SHORTCUT_PATH%" (
    echo Creating desktop shortcut...
    powershell -NoProfile -Command ^
      "$ws = New-Object -ComObject WScript.Shell; ^
       $sc = $ws.CreateShortcut('%SHORTCUT_PATH%'); ^
       $sc.TargetPath = '%~dp0start-dev.bat'; ^
       $sc.WorkingDirectory = '%~dp0'; ^
       $sc.Description = 'pi-forge Dev Server'; ^
       $sc.IconLocation = '%~dp0docs\images\icon.png,0'; ^
       $sc.Save()"
    if exist "%SHORTCUT_PATH%" (
        echo [2/3] Desktop shortcut created.
    ) else (
        echo [2/3] Failed to create shortcut, skip.
    )
) else (
    echo [2/3] Desktop shortcut already exists, skip.
)

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
