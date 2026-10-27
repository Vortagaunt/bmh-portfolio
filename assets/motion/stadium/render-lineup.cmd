@echo off
rem Starting lineup videos: one 8K video per player in lineup.json (next to this file).
rem Double-click, or drag a different lineup .json onto this file (keep real rosters out of the repo).
rem Renders into Downloads\LRHS Redesign - Bronx Hanratty\13 Stadium motion\Lineup.
setlocal
set "LINEUP=%~dp0lineup.json"
if not "%~1"=="" set "LINEUP=%~f1"
cd /d "%~dp0..\..\.."
set "OUT_DIR=%USERPROFILE%\Downloads\LRHS Redesign - Bronx Hanratty\13 Stadium motion\Lineup"
set RES=8k
set FPS=29.97
where ffmpeg >nul 2>nul || (echo ffmpeg isn't on PATH. Install it ^(winget install Gyan.FFmpeg^), then run this again. & pause & exit /b 1)
node scripts\render-stadium-motion.mjs lineup
echo.
pause
