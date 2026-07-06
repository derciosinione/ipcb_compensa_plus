#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

dotnet test Backend/Compensa.Identity.Api/CompensaIdentityApi.Tests/CompensaIdentityApi.Tests.csproj \
  --filter "Category=Integration"
