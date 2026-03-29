$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

docker compose down --remove-orphans

Write-Host "App has been stopped."
