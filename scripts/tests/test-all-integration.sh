#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

./scripts/tests/test-core-integration.sh
./scripts/tests/test-identity-integration.sh
./scripts/tests/test-notifications-integration.sh
./scripts/tests/test-ai-integration.sh
