@echo off
echo Killing processes on ports 9144 and 9145...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9144 ^| findstr LISTENING') do (
    echo Killing PID %%a on port 9144
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9145 ^| findstr LISTENING') do (
    echo Killing PID %%a on port 9145
    taskkill /F /PID %%a 2>nul
)

echo Done.
pause