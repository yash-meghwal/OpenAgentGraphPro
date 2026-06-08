# Configures OpenAgentGraphPro so it cannot accidentally push to V1 OpenAgentGraph.
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

git config core.hooksPath .githooks

$remotes = git remote
if ($remotes -contains "origin") {
  $originUrl = git remote get-url origin
  if ($originUrl -match "yash-meghwal/OpenAgentGraph") {
    git remote rename origin openagentgraph-v1-readonly
    Write-Host "Renamed origin -> openagentgraph-v1-readonly (fetch-only reference to V1)."
  }
}

if ($remotes -contains "openagentgraph-v1-readonly" -or (git remote) -contains "openagentgraph-v1-readonly") {
  git remote set-url --push openagentgraph-v1-readonly PUSH_BLOCKED_PRO_WORKSPACE
}

Write-Host "Pro git guard active:"
Write-Host "  - core.hooksPath=.githooks"
Write-Host "  - pre-push blocks github.com/yash-meghwal/OpenAgentGraph"
Write-Host "  - add your Pro remote with: git remote add origin <OpenAgentGraphPro repo URL>"