#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

dotnet test Backend/Compensa.Core.Api/CompensaCoreApi.Tests/CompensaCoreApi.Tests.csproj \
  --filter "Category=Unit"
