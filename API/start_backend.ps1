# start_backend.ps1
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$env:ARGUS_HEADLESS="1"
$env:ARGUS_ALLOW_GUI_FALLBACK="0"
$env:ARGUS_CHROME_MAJOR="145"
$env:ARGUS_HEADLESS_RETRIES="2"

uv run manage.py runserver --noreload --nothreading
