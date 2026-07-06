#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../../Frontend"

pnpm test:e2e:ui "$@"
