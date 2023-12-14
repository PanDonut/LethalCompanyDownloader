if (Test-Path -Path ".\node_modules") {
    .\binaries\node index.js
} else {
    .\binaries\npm i
    Write-Host "----PLEASE RELAUNCH INIT.BAT!----"
    Read-Host "Press Enter to continue..."
}
