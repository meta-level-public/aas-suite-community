#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"
project_path="$repo_root/services/aas-designer/AasDesignerApi.Enterprise/AasDesignerApi.Enterprise.csproj"
migrations_dir="$repo_root/services/aas-designer/AasDesignerApi/Migrations"
migration_name="${1:-InitialCreate}"

rm -f "$migrations_dir"/*.cs

pushd "$repo_root" >/dev/null
dotnet ef migrations add "$migration_name" \
  --project "$project_path" \
  --startup-project "$project_path" \
  --context AasSuiteContext \
  --output-dir ../AasDesignerApi/Migrations
pnpm run format:services
popd >/dev/null

echo "Recreated AAS Designer migrations with initial migration '$migration_name'."