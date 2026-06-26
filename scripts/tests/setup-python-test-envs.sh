#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

setup_service() {
  local service_dir="$1"

  echo "Preparing Python test environment for ${service_dir}..."
  cd "$service_dir"

  if [ ! -x ".venv/bin/python" ]; then
    python3 -m venv .venv
  fi

  .venv/bin/python -m pip install --upgrade pip
  .venv/bin/python -m pip install -r requirements.txt pytest pytest-asyncio httpx

  cd - >/dev/null
}

setup_service "Backend/Compensa.Notifications"
setup_service "Backend/CompensaAI"

echo "Python test environments are ready."
