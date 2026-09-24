#!/usr/bin/env bash
set -euo pipefail

KCADM=/opt/keycloak/bin/kcadm.sh
SERVER_URL=${KEYCLOAK_SERVER_URL:-http://keycloak:8080}
REALM=${KEYCLOAK_REALM:-aas-local}
ADMIN_REALM=${KEYCLOAK_ADMIN_REALM:-master}

until "$KCADM" config credentials \
  --server "$SERVER_URL" \
  --realm "$ADMIN_REALM" \
  --user "$KEYCLOAK_ADMIN_USERNAME" \
  --password "$KEYCLOAK_ADMIN_PASSWORD" >/dev/null 2>&1; do
  echo "Waiting for Keycloak..."
  sleep 2
done

ensure_client() {
  local client_id=$1
  local secret=$2
  local role=$3
  local audience=$4
  local token_exchange=${5:-false}
  local client_uuid

  client_uuid=$("$KCADM" get clients -r "$REALM" -q "clientId=$client_id" \
    --fields id --format csv --noquotes 2>/dev/null | head -n 1 || true)
  cat >"/tmp/$client_id.json" <<EOF
{
  "clientId": "$client_id",
  "secret": "$secret",
  "enabled": true,
  "protocol": "openid-connect",
  "publicClient": false,
  "serviceAccountsEnabled": true,
  "standardFlowEnabled": false,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": false,
  "attributes": {
    "standard.token.exchange.enabled": "$token_exchange"
  },
  "protocolMappers": [
    {
      "name": "dpp-role",
      "protocol": "openid-connect",
      "protocolMapper": "oidc-hardcoded-claim-mapper",
      "config": {
        "claim.name": "role",
        "claim.value": "$role",
        "jsonType.label": "String",
        "access.token.claim": "true",
        "id.token.claim": "false"
      }
    },
    {
      "name": "dpp-api-audience",
      "protocol": "openid-connect",
      "protocolMapper": "oidc-audience-mapper",
      "config": {
        "included.custom.audience": "$audience",
        "access.token.claim": "true",
        "id.token.claim": "false"
      }
    }
  ]
}
EOF

  if [[ -z "$client_uuid" ]]; then
    echo "Creating Keycloak client: $client_id"
    "$KCADM" create clients -r "$REALM" -f "/tmp/$client_id.json" >/dev/null
  else
    echo "Updating Keycloak client: $client_id"
    "$KCADM" update "clients/$client_uuid" -r "$REALM" \
      -f "/tmp/$client_id.json" >/dev/null
  fi
  echo "Configured Keycloak client: $client_id"
}

ensure_client \
  "${DPP_GATEWAY_CLIENT_ID:-dpp-gateway}" \
  "$DPP_GATEWAY_CLIENT_SECRET" \
  viewer \
  "${DPP_API_AUDIENCE:-dpp-api}" \
  true

ensure_client \
  "${DPP_POLICY_ADMIN_CLIENT_ID:-dpp-policy-admin}" \
  "$DPP_POLICY_ADMIN_CLIENT_SECRET" \
  policy-admin \
  "${DPP_API_AUDIENCE:-dpp-api}"
