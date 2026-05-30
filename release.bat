@echo off
REM One-command release script for Windows
REM Usage: release.bat 1.1.0
REM        release.bat 1.1.0 --allow-empty  (if no CHANGELOG entries)

setlocal enabledelayedexpansion

if "%1"=="" (
  echo Usage: release.bat ^<new-version^> [--allow-empty]
  echo Example: release.bat 1.1.0
  exit /b 1
)

set VERSION=%1
set ALLOW_EMPTY=%2

echo ========================================
echo  Huiyu PiwebUI Forge Release v%VERSION%
echo ========================================
echo.

REM Step 1: Run the version bump script
echo [1/5] Bumping version numbers...
bash scripts/bump-version.sh %VERSION% %ALLOW_EMPTY%
if %errorlevel% neq 0 (
  echo FAILED: bump-version.sh exited with code %errorlevel%
  exit /b %errorlevel%
)

REM Step 2: Commit
echo [2/5] Committing...
git add -A
git commit -m "chore(release): v%VERSION%"
if %errorlevel% neq 0 (
  echo FAILED: git commit
  exit /b %errorlevel%
)

REM Step 3: Tag
echo [3/5] Tagging v%VERSION%...
git tag v%VERSION%
if %errorlevel% neq 0 (
  echo FAILED: git tag
  exit /b %errorlevel%
)

REM Step 4: Push
echo [4/5] Pushing to GitHub...
git push origin main --tags
if %errorlevel% neq 0 (
  echo FAILED: git push
  exit /b %errorlevel%
)

echo.
echo ========================================
echo  ✅ v%VERSION% released successfully!
echo ========================================
echo  GitHub Actions is now building:
echo    - Docker images ^(ghcr.io^)
echo    - GitHub Release
echo.
echo  Check progress at:
echo    https://github.com/huiyu9144/Huiyu-PiwebUI-Forge/actions
echo ========================================
