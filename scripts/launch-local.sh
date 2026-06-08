#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js/npm is required. Install Node 20.19+ from https://nodejs.org/" >&2
  exit 1
fi

npm run launch "$@"