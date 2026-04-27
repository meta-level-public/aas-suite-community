#!/usr/bin/env bash
set -euo pipefail

create_db_if_missing() {
  local db_name="$1"
  if [ -z "${db_name}" ] || [ "${db_name}" = "${POSTGRES_DB}" ]; then
    return
  fi

  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<EOSQL
SELECT 'CREATE DATABASE "' || '${db_name}' || '"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${db_name}')\gexec
EOSQL
}

create_db_if_missing "${BASYX_POSTGRES_DB:-}"
if [ "${KEYCLOAK_POSTGRES_DB:-}" != "${BASYX_POSTGRES_DB:-}" ]; then
  create_db_if_missing "${KEYCLOAK_POSTGRES_DB:-}"
fi
