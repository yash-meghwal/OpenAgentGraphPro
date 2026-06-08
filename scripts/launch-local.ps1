# One-click local launcher for OpenAgentGraph Pro (browser dev mode).
$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "Node.js/npm is required. Install Node 20.19+ from https://nodejs.org/"
}

npm run launch @args
exit $LASTEXITCODE