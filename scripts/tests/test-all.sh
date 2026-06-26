#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

./scripts/tests/test-all-unit.sh
./scripts/tests/test-all-integration.sh
./scripts/tests/test-frontend-build.sh
./scripts/tests/test-frontend-e2e.sh
