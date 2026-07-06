#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../../Backend/Compensa.Notifications"

PYTHON_BIN="${PYTHON_BIN:-python3}"
if [ -x ".venv/bin/python" ]; then
  PYTHON_BIN=".venv/bin/python"
elif [ -x "venv/bin/python" ]; then
  PYTHON_BIN="venv/bin/python"
fi

if ! "$PYTHON_BIN" -m pytest --version >/dev/null 2>&1; then
  echo "pytest is not installed. Run: pip install -r requirements.txt pytest pytest-asyncio httpx" >&2
  exit 1
fi

PYTHONPATH=. "$PYTHON_BIN" -m pytest tests/test_auth.py tests/test_health.py "$@"
