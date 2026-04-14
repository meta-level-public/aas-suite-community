#!/bin/sh
set -eu

API_BASE_URL="${FRONTEND_API_BASE_URL:-http://localhost:5196/designer-api}"
FEEDMAPPING_BASE_URL="${FRONTEND_FEEDMAPPING_BASE_URL:-http://localhost:5196}"
DESIGNER_BASE_URL="${FRONTEND_DESIGNER_BASE_URL:-$(printf '%s' "${API_BASE_URL}" | sed 's#/designer-api$#/designer#')}"
ROOT_DIR="/usr/share/caddy"
if [ -d "/usr/share/caddy/browser" ]; then
  ROOT_DIR="/usr/share/caddy/browser"
fi
INDEX_FILE="${ROOT_DIR}/index.html"

cat >"${ROOT_DIR}/runtime-config.js" <<EOF
window.__AAS_FRONTEND_API_BASE_URL = "${API_BASE_URL}";
window.__AAS_FRONTEND_FEEDMAPPING_BASE_URL = "${FEEDMAPPING_BASE_URL}";
window.__AAS_FRONTEND_DESIGNER_BASE_URL = "${DESIGNER_BASE_URL}";
EOF

ESCAPED_API_BASE_URL="$(printf '%s' "${API_BASE_URL}" | sed 's/[&|]/\\&/g')"
ESCAPED_API_BASE_URL_WITH_SLASH="$(printf '%s/' "${API_BASE_URL}" | sed 's/[&|]/\\&/g')"
ESCAPED_DESIGNER_BASE_URL="$(printf '%s' "${DESIGNER_BASE_URL}" | sed 's/[&|]/\\&/g')"
find "${ROOT_DIR}" -type f -name '*.js' -exec sed -i "s|http://localhost:5196/designer-api|${ESCAPED_API_BASE_URL}|g" {} +
find "${ROOT_DIR}" -type f -name '*.js' -exec sed -i "s|http://localhost:5196/designer|${ESCAPED_DESIGNER_BASE_URL}|g" {} +
find "${ROOT_DIR}" -type f -name '*.js' -exec sed -i "s|strictDiscoveryDocumentValidation:!1,skipIssuerCheck:!0|strictDiscoveryDocumentValidation:!1,skipIssuerCheck:!0,requireHttps:!1|g" {} +
find "${ROOT_DIR}" -type f -name '*.js' -exec sed -i "s|strictDiscoveryDocumentValidation:false,skipIssuerCheck:true|strictDiscoveryDocumentValidation:false,skipIssuerCheck:true,requireHttps:false|g" {} +
find "${ROOT_DIR}" -type f -name '*.js' -exec sed -i 's|requireHttps:\"remoteOnly\"|requireHttps:!1|g' {} +
CONFIG_FILE="${ROOT_DIR}/config/app-config.json"
if [ -f "${CONFIG_FILE}" ]; then
  sed -i "s|http://localhost:5196/designer/|${ESCAPED_API_BASE_URL_WITH_SLASH}|g" "${CONFIG_FILE}"
fi
FALLBACK_CONFIG_FILE="/usr/share/caddy/config/app-config.json"
if [ -f "${FALLBACK_CONFIG_FILE}" ]; then
  sed -i "s|http://localhost:5196/designer/|${ESCAPED_API_BASE_URL_WITH_SLASH}|g" "${FALLBACK_CONFIG_FILE}"
fi

if [ -f "${INDEX_FILE}" ] && ! grep -q "runtime-config.js" "${INDEX_FILE}"; then
  sed -i 's#<head>#<head><script src="/runtime-config.js"></script>#' "${INDEX_FILE}"
fi

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
