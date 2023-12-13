@echo off
if exist node_modules (
    .\binaries\node index.js
) else (
    copy ".\assets\PerfectDOSVGA437.ttf" "%WINDIR%\Fonts"
    reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" /v "Perfect DOS VGA 437" /t REG_SZ /d PerfectDOSVGA437.ttf /f
    .\binaries\npm i
    echo ----PLEASE RELAUNCH INIT.BAT!----
    pause
)