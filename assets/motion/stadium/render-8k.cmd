@echo off
rem The ten stadium pieces in 8K: ProRes 422 HQ + H.265, 29.97 fps (the brief's 8K fallback).
rem Double-click to render into Downloads\LRHS Redesign - Bronx Hanratty\13 Stadium motion,
rem or drag another folder (another drive) onto this file to render there instead.
rem Stop any time with Ctrl+C: run it again and it carries on from the next unfinished file.
setlocal
cd /d "%~dp0..\..\.."
set "OUT_DIR=%USERPROFILE%\Downloads\LRHS Redesign - Bronx Hanratty\13 Stadium motion"
if not "%~1"=="" set "OUT_DIR=%~1"
set RES=8k
set FPS=29.97
where ffmpeg >nul 2>nul || (echo ffmpeg isn't on PATH. Install it ^(winget install Gyan.FFmpeg^), then run this again. & pause & exit /b 1)
node scripts\render-stadium-motion.mjs all
echo.
pause
