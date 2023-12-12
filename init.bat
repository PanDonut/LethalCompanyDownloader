@echo off
if exist node_modules (
    .\binaries\node index.js
) else (
    .\binaries\npm i
    echo PLEASE RELAUNCH INIT.BAT!
    pause
)