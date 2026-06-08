#!/usr/bin/env sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

git config core.hooksPath .githooks

if git remote | grep -qx origin; then
  origin_url="$(git remote get-url origin)"
  case "$origin_url" in
    *yash-meghwal/OpenAgentGraph*)
      git remote rename origin openagentgraph-v1-readonly
      echo "Renamed origin -> openagentgraph-v1-readonly (fetch-only reference to V1)."
      ;;
  esac
fi

if git remote | grep -qx openagentgraph-v1-readonly; then
  git remote set-url --push openagentgraph-v1-readonly PUSH_BLOCKED_PRO_WORKSPACE
fi

echo "Pro git guard active:"
echo "  - core.hooksPath=.githooks"
echo "  - pre-push blocks github.com/yash-meghwal/OpenAgentGraph"
echo "  - add your Pro remote with: git remote add origin <OpenAgentGraphPro repo URL>"