#!/usr/bin/env bash

# Baut das portable Wizard-Paket (ZIP) für eine Variante.
# Wird von export-community-zip.sh, export-enterprise-zip.sh und den CI-Workflows verwendet.
#
# Aufruf: package-wizard.sh <oss|enterprise> <ziel-verzeichnis>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VARIANT="${1-}"
OUT_DIR="${2-}"

if [ "$VARIANT" != "oss" ] && [ "$VARIANT" != "enterprise" ]; then
  echo "Aufruf: $0 <oss|enterprise> <ziel-verzeichnis>" >&2
  exit 1
fi
if [ -z "$OUT_DIR" ]; then
  echo "FEHLER: Ziel-Verzeichnis fehlt." >&2
  exit 1
fi
if ! command -v zip >/dev/null 2>&1; then
  echo "FEHLER: 'zip' ist nicht installiert." >&2
  exit 1
fi

PACKAGE_NAME="docker-compose-wizard-$VARIANT"
mkdir -p "$OUT_DIR"
OUT_DIR="$(cd "$OUT_DIR" && pwd)"
ZIP_PATH="$OUT_DIR/$PACKAGE_NAME.zip"

BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/compose-wizard-$VARIANT.XXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT
PACKAGE_DIR="$BUILD_DIR/$PACKAGE_NAME"

mkdir -p "$PACKAGE_DIR/$VARIANT" "$PACKAGE_DIR/lib" "$PACKAGE_DIR/stack-assets/dpp-security" "$PACKAGE_DIR/stack-assets/keycloak-bootstrap"

# Gemeinsames README im Repo, im OSS-Export nur das README der Variante
if [ -f "$SCRIPT_DIR/README.md" ]; then
  cp "$SCRIPT_DIR/README.md" "$PACKAGE_DIR/"
else
  cp "$SCRIPT_DIR/$VARIANT/README.md" "$PACKAGE_DIR/"
fi
cp "$SCRIPT_DIR/lib/common.sh" "$PACKAGE_DIR/lib/"
cp "$SCRIPT_DIR/$VARIANT/create-compose-$VARIANT.sh" "$PACKAGE_DIR/$VARIANT/"
cp "$SCRIPT_DIR/$VARIANT/create-compose-$VARIANT-non-interactive.sh" "$PACKAGE_DIR/$VARIANT/"
cp "$SCRIPT_DIR/$VARIANT/build-local-images-$VARIANT.sh" "$PACKAGE_DIR/$VARIANT/"
if [ -f "$SCRIPT_DIR/$VARIANT/postgres-init/10-create-basyx-db.sh" ]; then
  mkdir -p "$PACKAGE_DIR/$VARIANT/postgres-init"
  cp "$SCRIPT_DIR/$VARIANT/postgres-init/10-create-basyx-db.sh" "$PACKAGE_DIR/$VARIANT/postgres-init/"
fi

cp -R "$SCRIPT_DIR/stack-assets/." "$PACKAGE_DIR/stack-assets/"
# Die OSS-Variante enthält keinen Lizenz-Public-Key
if [ "$VARIANT" = "oss" ]; then
  rm -rf "$PACKAGE_DIR/stack-assets/licensing"
fi

# DPP-Startregeln und Keycloak-Bootstrap für die DPP-Dienste (prepare_dpp_assets)
cp "$ROOT_DIR/deploy/shared/dpp-security/access-rules.json" "$PACKAGE_DIR/stack-assets/dpp-security/"
cp "$ROOT_DIR/deploy/shared/dpp-security/trustlist.json" "$PACKAGE_DIR/stack-assets/dpp-security/"
cp "$ROOT_DIR/deploy/shared/keycloak-bootstrap/bootstrap-dpp-clients.sh" "$PACKAGE_DIR/stack-assets/keycloak-bootstrap/"

# Das DPP-Explorer-Plugin ist optional (nur vorhanden, wenn es lokal gebaut wurde)
if [ -f "$ROOT_DIR/plugins/dpp-explorer-plugin.zip" ]; then
  mkdir -p "$PACKAGE_DIR/plugins"
  cp "$ROOT_DIR/plugins/dpp-explorer-plugin.zip" "$PACKAGE_DIR/plugins/"
else
  echo "Hinweis: plugins/dpp-explorer-plugin.zip nicht gefunden, Paket enthält kein DPP-Explorer-Plugin." >&2
fi

find "$PACKAGE_DIR" -name '.DS_Store' -delete

rm -f "$ZIP_PATH"
(
  cd "$BUILD_DIR"
  zip -qr "$ZIP_PATH" "$PACKAGE_NAME"
)

echo "Wizard-ZIP ($VARIANT) erstellt: $ZIP_PATH"
