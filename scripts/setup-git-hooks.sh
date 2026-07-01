#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

chmod +x .githooks/pre-push

git config core.hooksPath .githooks
git config pull.rebase true
git config fetch.prune true

echo "Git configurado para este repo:"
echo "  core.hooksPath = .githooks (pre-push bloquea si vas detrás de origin)"
echo "  pull.rebase = true"
echo "  fetch.prune = true"
echo ""
echo "Antes de push en cualquier dispositivo: git pull --rebase origin main"
