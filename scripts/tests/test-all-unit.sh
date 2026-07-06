#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

./scripts/tests/test-core-unit.sh
./scripts/tests/test-identity-unit.sh
./scripts/tests/test-notifications-unit.sh
./scripts/tests/test-ai-unit.sh
