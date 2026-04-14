#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WIZARD_SECTION_INDEX=0
STACK_ASSETS_DIR_NAME="stack-assets"
if [ -n "${NO_COLOR-}" ]; then
  RED=''
  GREEN=''
  YELLOW=''
  BLUE=''
  CYAN=''
  WHITE=''
  DIM=''
  NC=''
else
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  CYAN='\033[0;36m'
  WHITE='\033[1;37m'
  DIM='\033[2;37m'
  NC='\033[0m'
fi

default_generated_stack_dir() {
  date +"./generated-stack-%Y%m%d%H%M%S"
}

default_generated_compose_file() {
  local stack_dir="$1"
  printf '%s/docker-compose.yml' "$stack_dir"
}

default_generated_env_file() {
  local stack_dir="$1"
  printf '%s/.env' "$stack_dir"
}

info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
  echo -e "${GREEN}[OK]${NC} $1"
}

divider() {
  printf '%s' '========================================'
}

header() {
  local title="$1"
  echo -e "\n${BLUE}$(divider)${NC}"
  echo -e "${BLUE}${title}${NC}"
  echo -e "${BLUE}$(divider)${NC}"
}

component_header() {
  local title="$1"
  WIZARD_SECTION_INDEX=$((WIZARD_SECTION_INDEX + 1))
  header "[${WIZARD_SECTION_INDEX}] $title"
}

wizard_banner() {
  local edition="${1:-GENERIC}"
  local mode="${2:-interactive}"

  echo -e "${CYAN}==============================================================${NC}"
  echo -e "${CYAN}  ___    ___   ____        ____  _   _ ___ _____ _____        ${NC}"
  echo -e "${CYAN} / _ \\  / _ \\ / ___|      / ___|| | | |_ _|_   _| ____|       ${NC}"
  echo -e "${CYAN}| |_| || |_| |\\___ \\ ____ \\___ \\| | | || |  | | |  _|         ${NC}"
  echo -e "${CYAN}|  _  ||  _  | ___) |_____|___) | |_| || |  | | | |___        ${NC}"
  echo -e "${CYAN}|_| |_||_| |_||____/      |____/ \\___/|___| |_| |_____|       ${NC}"
  echo -e "${CYAN}==============================================================${NC}"
  echo -e "${BLUE}AAS Suite Compose Wizard${NC} ${WHITE}($edition | $mode)${NC}"
  echo -e "${DIM}Powered by Meta-Level Software AG${NC}"
  echo -e "${DIM}Fill in the sections below. Press Enter to accept defaults.${NC}"
  echo
}

warn() {
  echo -e "${YELLOW}[WARN]${NC} $1" >&2
}

die() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
  exit 1
}

trim() {
  local value="$1"
  # shellcheck disable=SC2001
  value="$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  printf '%s' "$value"
}

normalize_url() {
  local value
  value="$(trim "$1")"
  printf '%s' "${value%/}"
}

ensure_designer_api_base_url() {
  local value
  value="$(normalize_url "$1")"

  case "$value" in
    */designer-api)
      printf '%s' "$value"
      ;;
    */designer)
      printf '%s/designer-api' "${value%/designer}"
      ;;
    *)
      printf '%s/designer-api' "$value"
      ;;
  esac
}

derive_gateway_base_url() {
  local value
  value="$(normalize_url "$1")"

  case "$value" in
    */designer-api)
      printf '%s' "${value%/designer-api}"
      ;;
    */designer)
      printf '%s' "${value%/designer}"
      ;;
    *)
      printf '%s' "$value"
      ;;
  esac
}

migrate_legacy_frontend_base_urls() {
  if [ -z "${BASE_URL-}" ]; then
    if [ -n "${PUBLIC_GATEWAY_URL-}" ]; then
      BASE_URL="$PUBLIC_GATEWAY_URL"
    elif [ -n "${FRONTEND_FEEDMAPPING_BASE_URL-}" ]; then
      BASE_URL="$FRONTEND_FEEDMAPPING_BASE_URL"
    elif [ -n "${FRONTEND_API_BASE_URL-}" ]; then
      BASE_URL="$(derive_gateway_base_url "$FRONTEND_API_BASE_URL")"
    fi
  fi

  if [ -n "${BASE_URL-}" ]; then
    BASE_URL="$(derive_gateway_base_url "$BASE_URL")"
    PUBLIC_GATEWAY_URL="$BASE_URL"
    FRONTEND_API_BASE_URL="$(ensure_designer_api_base_url "$BASE_URL")"
    FRONTEND_FEEDMAPPING_BASE_URL="$BASE_URL"
  fi
}

apply_standard_container_ports() {
  DESIGNER_BACKEND_CONTAINER_PORT="8080"
  GATEWAY_CONTAINER_PORT="8080"
  FRONTEND_CONTAINER_PORT="80"
  FEEDMAPPING_CONTAINER_PORT="8080"
  HEALTH_DASHBOARD_CONTAINER_PORT="8080"
  POSTGRES_CONTAINER_PORT="5432"
}

rewrite_keycloak_realm_for_base_url() {
  local realm_file="$1"
  local public_base_url="$2"

  AAS_BASE_URL="$(normalize_url "$public_base_url")" perl -0pi -e '
    my $base = $ENV{AAS_BASE_URL};
    s/"rootUrl":\s*"[^"]*"/"rootUrl": "$base"/g;
    s/"baseUrl":\s*"[^"]*"/"baseUrl": "$base"/g;
    s/"redirectUris":\s*\[[^\]]*\]/"redirectUris": [\n        "$base\/sso-login-success",\n        "$base\/*"\n      ]/sg;
    s/"webOrigins":\s*\[[^\]]*\]/"webOrigins": [\n        "$base"\n      ]/sg;
  ' "$realm_file"
}

load_state_file() {
  local state_file="$1"
  if [ -f "$state_file" ]; then
    # shellcheck disable=SC1090
    source "$state_file"
  fi
}

load_env_file() {
  local env_file="$1"
  if [ -n "$env_file" ] && [ -f "$env_file" ]; then
    # shellcheck disable=SC1090
    source "$env_file"
  fi
}

state_default() {
  local key="$1"
  local fallback="$2"
  local current="${!key-}"
  if [ -n "$current" ]; then
    printf '%s' "$current"
  else
    printf '%s' "$fallback"
  fi
}

resolve_path_from_dir() {
  local base_dir="$1"
  local path_value="$2"

  if [ -z "$path_value" ]; then
    printf '%s' ""
    return
  fi

  case "$path_value" in
    /*) printf '%s' "$path_value" ;;
    *) printf '%s/%s' "$base_dir" "$path_value" ;;
  esac
}

set_default_if_empty() {
  local key="$1"
  local default_value="$2"
  local current="${!key-}"
  if [ -z "$current" ]; then
    eval "$key=\"\$default_value\""
  fi
}

require_non_empty() {
  local key="$1"
  local value="${!key-}"
  if [ -z "$value" ]; then
    die "Pflichtwert fehlt: $key"
  fi
}

save_state_file() {
  local state_file="$1"
  shift
  local state_dir
  local tmp_file
  local key
  local value

  state_dir="$(dirname "$state_file")"
  mkdir -p "$state_dir"
  tmp_file="${state_file}.tmp"

  {
    printf '# Generated by docker-compose wizard\n'
    for key in "$@"; do
      value="${!key-}"
      printf '%s=%q\n' "$key" "$value"
    done
  } > "$tmp_file"

  mv "$tmp_file" "$state_file"
}

prompt_with_default() {
  local __var_name="$1"
  local label="$2"
  local default_value="$3"
  local user_input
  local prompt_text

  prompt_text="> $label [$default_value]: "
  read -r -p "$prompt_text" user_input
  user_input="$(trim "$user_input")"

  if [ -z "$user_input" ]; then
    user_input="$default_value"
  fi

  eval "$__var_name=\"$user_input\""
}

prompt_required() {
  local __var_name="$1"
  local label="$2"
  local user_input
  local prompt_text

  while true; do
    prompt_text="> $label: "
    read -r -p "$prompt_text" user_input
    user_input="$(trim "$user_input")"
    if [ -n "$user_input" ]; then
      eval "$__var_name=\"$user_input\""
      return
    fi
    warn "Eingabe ist erforderlich."
  done
}

prompt_required_with_default() {
  local __var_name="$1"
  local label="$2"
  local default_value="$3"
  local user_input
  local prompt_text

  while true; do
    prompt_text="> $label [$default_value]: "
    read -r -p "$prompt_text" user_input
    user_input="$(trim "$user_input")"
    if [ -z "$user_input" ]; then
      user_input="$default_value"
    fi
    if [ -n "$user_input" ]; then
      eval "$__var_name=\"$user_input\""
      return
    fi
    warn "Eingabe ist erforderlich."
  done
}

prompt_required_with_default_suggestions() {
  local __var_name="$1"
  local label="$2"
  local default_value="$3"
  local suggestions="$4"
  local user_input
  local prompt_text

  while true; do
    prompt_text="> $label [$default_value] {${suggestions}}: "
    read -r -p "$prompt_text" user_input
    user_input="$(trim "$user_input")"
    if [ -z "$user_input" ]; then
      user_input="$default_value"
    fi
    if [ -n "$user_input" ]; then
      eval "$__var_name=\"$user_input\""
      return
    fi
    warn "Eingabe ist erforderlich."
  done
}

is_number() {
  case "$1" in
    ''|*[!0-9]*) return 1 ;;
    *) return 0 ;;
  esac
}

is_db_identifier() {
  case "$1" in
    ''|*[!a-zA-Z0-9_]*)
      return 1
      ;;
    *)
      return 0
      ;;
  esac
}

prompt_port() {
  local __var_name="$1"
  local label="$2"
  local default_value="$3"
  local value

  while true; do
    prompt_with_default value "$label" "$default_value"
    if ! is_number "$value"; then
      warn "Port muss numerisch sein."
      continue
    fi
    if [ "$value" -lt 1 ] || [ "$value" -gt 65535 ]; then
      warn "Port muss zwischen 1 und 65535 liegen."
      continue
    fi
    eval "$__var_name=\"$value\""
    return
  done
}

prompt_choice() {
  local __var_name="$1"
  local label="$2"
  local allowed_csv="$3"
  local default_value="$4"
  local value
  local allowed=",$allowed_csv,"

  while true; do
    prompt_with_default value "$label ($allowed_csv)" "$default_value"
    if [[ "$allowed" == *",$value,"* ]]; then
      eval "$__var_name=\"$value\""
      return
    fi
    warn "Ungültige Auswahl: $value"
  done
}

assert_unique_ports() {
  local ports=("$@")
  local i
  local j

  for ((i = 0; i < ${#ports[@]}; i++)); do
    for ((j = i + 1; j < ${#ports[@]}; j++)); do
      if [ "${ports[$i]}" = "${ports[$j]}" ]; then
        die "Port-Kollision erkannt: ${ports[$i]}"
      fi
    done
  done
}

init_output_files() {
  local compose_file="$1"
  local env_file="$2"
  local compose_dir env_dir

  compose_dir="$(dirname "$compose_file")"
  env_dir="$(dirname "$env_file")"
  mkdir -p "$compose_dir" "$env_dir"

  : > "$compose_file"
  : > "$env_file"
}

write_env() {
  local env_file="$1"
  local key="$2"
  local value="$3"
  printf '%s=%s\n' "$key" "$value" >> "$env_file"
}

compose_begin() {
  local compose_file="$1"

  cat >> "$compose_file" <<EOF_COMPOSE
services:
EOF_COMPOSE
}

append_service_separator() {
  local compose_file="$1"
  printf '\n' >> "$compose_file"
}

append_postgres_service() {
  local compose_file="$1"
  local network_name="$2"
  local volume_name="$3"

  cat >> "$compose_file" <<EOF_COMPOSE
  postgres:
    image: \${POSTGRES_IMAGE_REPO}:\${POSTGRES_IMAGE_TAG}
    container_name: \${PROJECT_NAME}-postgres
    environment:
      POSTGRES_DB: \${POSTGRES_DB}
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      BASYX_POSTGRES_DB: \${BASYX_POSTGRES_DB}
      KEYCLOAK_POSTGRES_DB: \${KEYCLOAK_POSTGRES_DB}
    volumes:
      - ${volume_name}:/var/lib/postgresql/data
      - ./postgres-init/10-create-basyx-db.sh:/docker-entrypoint-initdb.d/10-create-basyx-db.sh:ro
    networks:
      - ${network_name}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER} -d \${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
EOF_COMPOSE
}

prepare_postgres_init_assets() {
  local compose_file="$1"
  local compose_dir init_dir init_script

  compose_dir="$(cd "$(dirname "$compose_file")" && pwd)"
  init_dir="${compose_dir}/postgres-init"
  init_script="${init_dir}/10-create-basyx-db.sh"

  mkdir -p "$init_dir"
  cat > "$init_script" <<'EOF_SCRIPT'
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
EOF_SCRIPT
  chmod +x "$init_script"
}

prepare_keycloak_assets() {
  local compose_file="$1"
  local realm_file="$2"
  local themes_path="$3"
  local public_base_url="${4:-${PUBLIC_GATEWAY_URL:-${BASE_URL:-}}}"
  local compose_dir assets_dir keycloak_dir

  compose_dir="$(cd "$(dirname "$compose_file")" && pwd)"
  assets_dir="${compose_dir}/${STACK_ASSETS_DIR_NAME}"
  keycloak_dir="${assets_dir}/keycloak"

  mkdir -p "$keycloak_dir"
  cp "$realm_file" "${keycloak_dir}/aas-local-realm.json"
  if [ -n "$public_base_url" ]; then
    rewrite_keycloak_realm_for_base_url "${keycloak_dir}/aas-local-realm.json" "$public_base_url"
  fi
  rm -rf "${keycloak_dir}/themes"
  cp -R "$themes_path" "${keycloak_dir}/themes"
}

prepare_security_env_assets() {
  local compose_file="$1"
  local compose_dir assets_dir source_dir

  compose_dir="$(cd "$(dirname "$compose_file")" && pwd)"
  assets_dir="${compose_dir}/${STACK_ASSETS_DIR_NAME}"
  source_dir="${SCRIPT_DIR}/../stack-assets/security_env"

  mkdir -p "$assets_dir"
  rm -rf "${assets_dir}/security_env"
  cp -R "$source_dir" "${assets_dir}/security_env"
}

prepare_licensing_assets() {
  local compose_file="$1"
  local compose_dir assets_dir source_dir licensing_dir

  compose_dir="$(cd "$(dirname "$compose_file")" && pwd)"
  assets_dir="${compose_dir}/${STACK_ASSETS_DIR_NAME}"
  source_dir="${SCRIPT_DIR}/../stack-assets/licensing"
  licensing_dir="${assets_dir}/licensing"

  mkdir -p "$assets_dir"
  rm -rf "$licensing_dir"
  cp -R "$source_dir" "$licensing_dir"
}

append_keycloak_internal_service() {
  local compose_file="$1"
  local network_name="$2"
  local host_port="$3"
  local public_gateway_url="$4"

  cat >> "$compose_file" <<EOF_COMPOSE
  keycloak:
    image: \${KEYCLOAK_IMAGE_REPO}:\${KEYCLOAK_IMAGE_TAG}
    container_name: \${PROJECT_NAME}-keycloak
    command: start-dev --http-port=8080 --hostname-strict=false --proxy-headers=xforwarded --import-realm --spi-theme-cache-themes=false --spi-theme-cache-templates=false
    environment:
      KC_DB: postgres
      KC_DB_URL_HOST: postgres
      KC_DB_URL_DATABASE: \${KEYCLOAK_POSTGRES_DB}
      KC_DB_USERNAME: \${POSTGRES_USER}
      KC_DB_PASSWORD: \${POSTGRES_PASSWORD}
      KC_PROXY_HEADERS: xforwarded
      KC_HOSTNAME_STRICT: "false"
      KC_BOOTSTRAP_ADMIN_USERNAME: \${KEYCLOAK_ADMIN_USERNAME}
      KC_BOOTSTRAP_ADMIN_PASSWORD: \${KEYCLOAK_ADMIN_PASSWORD}
    ports:
      - "${host_port}:8080"
    volumes:
      - \${KEYCLOAK_REALM_FILE}:/opt/keycloak/data/import/aas-local-realm.json:ro
      - \${KEYCLOAK_THEMES_PATH}:/opt/keycloak/themes:ro
    networks:
      - ${network_name}
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "bash -c 'cat < /dev/null > /dev/tcp/127.0.0.1/8080'"]
      interval: 10s
      timeout: 5s
      retries: 15
      start_period: 30s
    restart: unless-stopped
EOF_COMPOSE
}

append_gateway_service() {
  local compose_file="$1"
  local network_name="$2"
  local host_port="$3"
  local container_port="$4"
  local keycloak_cluster_url="$5"
  local designer_cluster_url="$6"
  local frontend_cluster_url="$7"
  local include_feedmapping="$8"
  local include_health_dashboard="${9:-false}"
  local keycloak_mode="${10:-existing}"
  local designer_service_name="${11:-designer-backend}"

  cat >> "$compose_file" <<EOF_COMPOSE
  gateway:
    image: \${GATEWAY_IMAGE_REPO}:\${GATEWAY_IMAGE_TAG}
    container_name: \${PROJECT_NAME}-gateway
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:${container_port}
      Session__Postgres__ConnectionString: Host=postgres;Port=5432;Database=\${POSTGRES_DB};Username=\${POSTGRES_USER};Password=\${POSTGRES_PASSWORD}
      Session__Postgres__SchemaName: public
      Session__Postgres__TableName: gateway_session_cache
      Session__Postgres__CreateIfNotExists: "true"
      Session__Postgres__ExpiredItemsDeletionInterval: 00:30:00
      Session__Postgres__DefaultSlidingExpiration: 08:00:00
      ReverseProxy__Clusters__keycloak-cluster__Destinations__destination1__Address: ${keycloak_cluster_url}
      ReverseProxy__Clusters__aas-designer-cluster__Destinations__destination1__Address: ${designer_cluster_url}
      ReverseProxy__Clusters__frontend-cluster__Destinations__destination1__Address: ${frontend_cluster_url}
EOF_COMPOSE

  if [ "$include_feedmapping" = "true" ]; then
    cat >> "$compose_file" <<EOF_COMPOSE
      ReverseProxy__Clusters__feed-mapping-cluster__Destinations__destination1__Address: http://feedmapping:8080
EOF_COMPOSE
  fi

  if [ "$include_health_dashboard" = "true" ]; then
    cat >> "$compose_file" <<EOF_COMPOSE
      ReverseProxy__Clusters__health-dashboard-cluster__Destinations__destination1__Address: http://health-dashboard:8080
EOF_COMPOSE
  fi

  cat >> "$compose_file" <<EOF_COMPOSE
    ports:
      - "${host_port}:${container_port}"
    networks:
      - ${network_name}
    depends_on:
      postgres:
        condition: service_healthy
      ${designer_service_name}:
        condition: service_healthy
EOF_COMPOSE

  if [ "$keycloak_mode" = "install" ]; then
    cat >> "$compose_file" <<EOF_COMPOSE
      keycloak:
        condition: service_healthy
EOF_COMPOSE
  fi

  cat >> "$compose_file" <<EOF_COMPOSE
    healthcheck:
      test: ["CMD-SHELL", "if command -v curl >/dev/null 2>&1; then curl -fsS http://127.0.0.1:${container_port}/health >/dev/null || exit 1; else kill -0 1; fi"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 20s
    restart: unless-stopped
EOF_COMPOSE
}

append_health_dashboard_service() {
  local compose_file="$1"
  local network_name="$2"
  local container_port="$3"
  local designer_service_name="${4:-designer-backend}"

  cat >> "$compose_file" <<EOF_COMPOSE
  health-dashboard:
    image: \${HEALTH_DASHBOARD_IMAGE_REPO}:\${HEALTH_DASHBOARD_IMAGE_TAG}
    container_name: \${PROJECT_NAME}-health-dashboard
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:${container_port}
    networks:
      - ${network_name}
    depends_on:
      gateway:
        condition: service_healthy
      feedmapping:
        condition: service_started
      ${designer_service_name}:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "if command -v curl >/dev/null 2>&1; then curl -fsS http://127.0.0.1:${container_port}/healthchecks-api >/dev/null || exit 1; else kill -0 1; fi"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
    restart: unless-stopped
EOF_COMPOSE
}

append_frontend_service() {
  local compose_file="$1"
  local network_name="$2"
  local container_port="$3"
  local designer_service_name="${4:-designer-backend}"

  cat >> "$compose_file" <<EOF_COMPOSE
  frontend:
    image: \${FRONTEND_IMAGE_REPO}:\${FRONTEND_IMAGE_TAG}
    container_name: \${PROJECT_NAME}-frontend
    environment:
      API_URL: http://${designer_service_name}:8080
      GATEWAY_URL: http://gateway:8080
      FRONTEND_API_BASE_URL: \${FRONTEND_API_BASE_URL}
      FRONTEND_FEEDMAPPING_BASE_URL: \${FRONTEND_FEEDMAPPING_BASE_URL}
    command:
      - /bin/sh
      - -ec
      - |
        ROOT_DIR="/usr/share/caddy"
        if [ -d "/usr/share/caddy/browser" ]; then
          ROOT_DIR="/usr/share/caddy/browser"
        fi
        FRONTEND_API_BASE_URL="\$\${FRONTEND_API_BASE_URL%/}"
        FRONTEND_FEEDMAPPING_BASE_URL="\$\${FRONTEND_FEEDMAPPING_BASE_URL%/}"
        GATEWAY_BASE_URL="\$\${FRONTEND_API_BASE_URL%/designer-api}"
        RUNTIME_CONFIG_FILE="\$\$ROOT_DIR/runtime-config.js"
        cat >"\$\$RUNTIME_CONFIG_FILE" <<EOF
        window.__AAS_FRONTEND_API_BASE_URL = "\${FRONTEND_API_BASE_URL}";
        window.__AAS_FRONTEND_FEEDMAPPING_BASE_URL = "\${FRONTEND_FEEDMAPPING_BASE_URL}";
        EOF
        ESCAPED_API_BASE_URL="\$\$(printf '%s' "\${FRONTEND_API_BASE_URL}" | sed 's/[&|]/\\\\&/g')"
        ESCAPED_API_BASE_URL_WITH_SLASH="\$\$(printf '%s/' "\${FRONTEND_API_BASE_URL}" | sed 's/[&|]/\\\\&/g')"
        DESIGNER_BASE_URL="\${FRONTEND_API_BASE_URL}"
        ESCAPED_DESIGNER_BASE_URL="\$\$(printf '%s' "\$\$DESIGNER_BASE_URL" | sed 's/[&|]/\\\\&/g')"
        ESCAPED_GATEWAY_BASE_URL="\$\$(printf '%s' "\$\$GATEWAY_BASE_URL" | sed 's/[&|]/\\\\&/g')"
        find "\$\$ROOT_DIR" -type f -name '*.js' -exec sed -i "s|http://localhost:5196/designer-api|\$\$ESCAPED_API_BASE_URL|g" {} +
        find "\$\$ROOT_DIR" -type f -name '*.js' -exec sed -i "s|http://localhost:5196/designer|\$\$ESCAPED_DESIGNER_BASE_URL|g" {} +
        find "\$\$ROOT_DIR" -type f -name '*.js' -exec sed -i "s|http://localhost:5196|\$\$ESCAPED_GATEWAY_BASE_URL|g" {} +
        find "\$\$ROOT_DIR" -type f -name '*.js' -exec sed -i "s|strictDiscoveryDocumentValidation:!1,skipIssuerCheck:!0|strictDiscoveryDocumentValidation:!1,skipIssuerCheck:!0,requireHttps:!1|g" {} +
        find "\$\$ROOT_DIR" -type f -name '*.js' -exec sed -i "s|strictDiscoveryDocumentValidation:false,skipIssuerCheck:true|strictDiscoveryDocumentValidation:false,skipIssuerCheck:true,requireHttps:false|g" {} +
        find "\$\$ROOT_DIR" -type f -name '*.js' -exec sed -i 's|requireHttps:\"remoteOnly\"|requireHttps:!1|g' {} +
        CONFIG_FILE="\$\$ROOT_DIR/config/app-config.json"
        if [ -f "\$\$CONFIG_FILE" ]; then
          sed -i "s|http://localhost:5196/designer/|\$\$ESCAPED_API_BASE_URL_WITH_SLASH|g" "\$\$CONFIG_FILE"
          sed -i "s|http://localhost:5196|\$\$ESCAPED_GATEWAY_BASE_URL|g" "\$\$CONFIG_FILE"
          sed -i "s|\"apiPath\": \"\$\$ESCAPED_API_BASE_URL\"|\"apiPath\": \"\$\$ESCAPED_API_BASE_URL/api\"|g" "\$\$CONFIG_FILE"
          sed -i 's|"apiPath": "/designer-api"|"apiPath": "/designer-api/api"|g' "\$\$CONFIG_FILE"
          sed -i 's|"aasApiPath": "/designer/|"aasApiPath": "/designer-api/|g' "\$\$CONFIG_FILE"
          sed -i 's|"aasProxyApiPath": "/designer/|"aasProxyApiPath": "/designer-api/|g' "\$\$CONFIG_FILE"
          sed -i 's|"aasSharedLinksApiPath": "/designer/|"aasSharedLinksApiPath": "/designer-api/|g' "\$\$CONFIG_FILE"
          sed -i 's|"aasDashboardApiPath": "/designer/|"aasDashboardApiPath": "/designer-api/|g' "\$\$CONFIG_FILE"
          sed -i 's|"aasSystemManagementApiPath": "/designer/|"aasSystemManagementApiPath": "/designer-api/|g' "\$\$CONFIG_FILE"
          sed -i 's|"aasHelpApiPath": "/designer/|"aasHelpApiPath": "/designer-api/|g' "\$\$CONFIG_FILE"
          sed -i 's|"aasViewerApiPath": "/designer/|"aasViewerApiPath": "/designer-api/|g' "\$\$CONFIG_FILE"
          sed -i 's|"aasViewerProxyPath": "/designer/|"aasViewerProxyPath": "/designer-api/|g' "\$\$CONFIG_FILE"
        fi
        FALLBACK_CONFIG_FILE="/usr/share/caddy/config/app-config.json"
        if [ -f "\$\$FALLBACK_CONFIG_FILE" ]; then
          sed -i "s|http://localhost:5196/designer/|\$\$ESCAPED_API_BASE_URL_WITH_SLASH|g" "\$\$FALLBACK_CONFIG_FILE"
          sed -i "s|http://localhost:5196|\$\$ESCAPED_GATEWAY_BASE_URL|g" "\$\$FALLBACK_CONFIG_FILE"
          sed -i "s|\"apiPath\": \"\$\$ESCAPED_API_BASE_URL\"|\"apiPath\": \"\$\$ESCAPED_API_BASE_URL/api\"|g" "\$\$FALLBACK_CONFIG_FILE"
          sed -i 's|"apiPath": "/designer-api"|"apiPath": "/designer-api/api"|g' "\$\$FALLBACK_CONFIG_FILE"
          sed -i 's|"aasApiPath": "/designer/|"aasApiPath": "/designer-api/|g' "\$\$FALLBACK_CONFIG_FILE"
          sed -i 's|"aasProxyApiPath": "/designer/|"aasProxyApiPath": "/designer-api/|g' "\$\$FALLBACK_CONFIG_FILE"
          sed -i 's|"aasSharedLinksApiPath": "/designer/|"aasSharedLinksApiPath": "/designer-api/|g' "\$\$FALLBACK_CONFIG_FILE"
          sed -i 's|"aasDashboardApiPath": "/designer/|"aasDashboardApiPath": "/designer-api/|g' "\$\$FALLBACK_CONFIG_FILE"
          sed -i 's|"aasSystemManagementApiPath": "/designer/|"aasSystemManagementApiPath": "/designer-api/|g' "\$\$FALLBACK_CONFIG_FILE"
          sed -i 's|"aasHelpApiPath": "/designer/|"aasHelpApiPath": "/designer-api/|g' "\$\$FALLBACK_CONFIG_FILE"
          sed -i 's|"aasViewerApiPath": "/designer/|"aasViewerApiPath": "/designer-api/|g' "\$\$FALLBACK_CONFIG_FILE"
          sed -i 's|"aasViewerProxyPath": "/designer/|"aasViewerProxyPath": "/designer-api/|g' "\$\$FALLBACK_CONFIG_FILE"
        fi
        INDEX_FILE="\$\$ROOT_DIR/index.html"
        if [ -f "\$\$INDEX_FILE" ] && ! grep -q "runtime-config.js" "\$\$INDEX_FILE"; then
          sed -i 's#<head>#<head><script src="/runtime-config.js"></script>#' "\$\$INDEX_FILE"
        fi
        cat >/tmp/Caddyfile <<EOF
        {
          auto_https off
        }
        :80 {
          root * \$\$ROOT_DIR
          encode gzip
          try_files {path} /index.html
          file_server
        }
        EOF
        exec caddy run --config /tmp/Caddyfile --adapter caddyfile
    networks:
      - ${network_name}
    depends_on:
      gateway:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O /dev/null http://127.0.0.1:${container_port} || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 20s
    restart: unless-stopped
EOF_COMPOSE
}

append_designer_backend_service() {
  local compose_file="$1"
  local network_name="$2"
  local container_port="$3"
  local gateway_container_port="$4"
  local keycloak_mode="${5:-existing}"
  local designer_service_name="${6:-designer-backend}"
  local include_enterprise_licensing="${7:-false}"

  cat >> "$compose_file" <<EOF_COMPOSE
  ${designer_service_name}:
    image: \${DESIGNER_BACKEND_IMAGE_REPO}:\${DESIGNER_BACKEND_IMAGE_TAG}
    container_name: \${PROJECT_NAME}-${designer_service_name}
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:${container_port}
      ConnectionStrings__PgDatabase: Host=postgres;Port=5432;Database=\${POSTGRES_DB};Username=\${POSTGRES_USER};Password=\${POSTGRES_PASSWORD}
      AppSettings__KeycloakEnabled: "true"
      AppSettings__KeycloakSsoSourceName: keycloak
      AppSettings__KeycloakIssuer: \${KEYCLOAK_ISSUER}
      AppSettings__KeycloakWellKnownUrl: \${KEYCLOAK_WELLKNOWN_URL}
      AppSettings__KeycloakPublicIssuer: \${KEYCLOAK_PUBLIC_ISSUER}
      AppSettings__KeycloakPublicWellKnownUrl: \${KEYCLOAK_PUBLIC_WELLKNOWN_URL}
      AppSettings__KeycloakClientId: \${KEYCLOAK_CLIENT_ID}
      AppSettings__KeycloakAudience: \${KEYCLOAK_AUDIENCE}
      AppSettings__KeycloakScopes: \${KEYCLOAK_SCOPES}
      AppSettings__KeycloakResourceAccessName: \${KEYCLOAK_RESOURCE_ACCESS_NAME}
      AppSettings__KeycloakAdminRealm: \${KEYCLOAK_ADMIN_REALM}
      AppSettings__KeycloakAdminClientId: \${KEYCLOAK_ADMIN_CLIENT_ID}
      AppSettings__KeycloakAdminClientSecret: \${KEYCLOAK_ADMIN_CLIENT_SECRET}
      AppSettings__KeycloakAdminUsername: \${KEYCLOAK_ADMIN_USERNAME}
      AppSettings__KeycloakAdminPassword: \${KEYCLOAK_ADMIN_PASSWORD}
      AppSettings__InitialOrganisationAdminEmail: \${INITIAL_ORGANISATION_ADMIN_EMAIL}
      AppSettings__InitialOrganisationAdminName: \${INITIAL_ORGANISATION_ADMIN_NAME}
      AppSettings__InitialOrganisationAdminVorname: \${INITIAL_ORGANISATION_ADMIN_VORNAME}
      AppSettings__InitialOrganisationAdminPassword: \${INITIAL_ORGANISATION_ADMIN_PASSWORD}
      AppSettings__Issuer: \${APP_JWT_ISSUER:-vws-portal}
      AppSettings__Salt: \${APP_JWT_SALT:-ja1nnNyDKoiTYu3LaBQ/9A==}
      AppSettings__Secret: \${APP_JWT_SECRET:-wik3RnSNPAPt85PFs9FZSQksdoughzfoafdt879uiaodfnbiezv79si90dpoawlcv}
      AppSettings__BaseUrl: \${BASE_URL}
      AppSettings__PublicBaseApiUrl: \${FRONTEND_API_BASE_URL}/api
      AppSettings__InitialAasDiscoveryUrl: \${BASYX_AAS_DISCOVERY_URL}
      AppSettings__InitialAasDiscoveryVersion: \${AAS_DISCOVERY_IMAGE_TAG}
      AppSettings__InitialAasDiscoveryContainer: \${BASYX_AAS_DISCOVERY_CONTAINER}
      AppSettings__InitialAasDiscoveryContainerPort: \${BASYX_AAS_DISCOVERY_CONTAINER_PORT}
      AppSettings__InitialAasDiscoveryHcUrl: \${BASYX_AAS_DISCOVERY_HC_URL}
      AppSettings__InitialAasRegistryUrl: \${BASYX_AAS_REGISTRY_URL}
      AppSettings__InitialAasRegistryVersion: \${AAS_REGISTRY_IMAGE_TAG}
      AppSettings__InitialAasRegistryContainer: \${BASYX_AAS_REGISTRY_CONTAINER}
      AppSettings__InitialAasRegistryContainerPort: \${BASYX_AAS_REGISTRY_CONTAINER_PORT}
      AppSettings__InitialAasRegistryHcUrl: \${BASYX_AAS_REGISTRY_HC_URL}
      AppSettings__InitialSubmodelRegistryUrl: \${BASYX_SUBMODEL_REGISTRY_URL}
      AppSettings__InitialSubmodelRegistryVersion: \${SUBMODEL_REGISTRY_IMAGE_TAG}
      AppSettings__InitialSubmodelRegistryContainer: \${BASYX_SUBMODEL_REGISTRY_CONTAINER}
      AppSettings__InitialSubmodelRegistryContainerPort: \${BASYX_SUBMODEL_REGISTRY_CONTAINER_PORT}
      AppSettings__InitialSubmodelRegistryHcUrl: \${BASYX_SUBMODEL_REGISTRY_HC_URL}
      AppSettings__InitialAasRepositoryUrl: \${BASYX_AAS_REPOSITORY_URL}
      AppSettings__InitialAasRepositoryVersion: \${AAS_REPOSITORY_IMAGE_TAG}
      AppSettings__InitialAasRepositoryContainer: \${BASYX_AAS_REPOSITORY_CONTAINER}
      AppSettings__InitialAasRepositoryContainerPort: \${BASYX_AAS_REPOSITORY_CONTAINER_PORT}
      AppSettings__InitialAasRepositoryHcUrl: \${BASYX_AAS_REPOSITORY_HC_URL}
      AppSettings__InitialSubmodelRepositoryUrl: \${BASYX_SUBMODEL_REPOSITORY_URL}
      AppSettings__InitialSubmodelRepositoryVersion: \${SUBMODEL_REPOSITORY_IMAGE_TAG}
      AppSettings__InitialSubmodelRepositoryContainer: \${BASYX_SUBMODEL_REPOSITORY_CONTAINER}
      AppSettings__InitialSubmodelRepositoryContainerPort: \${BASYX_SUBMODEL_REPOSITORY_CONTAINER_PORT}
      AppSettings__InitialSubmodelRepositoryHcUrl: \${BASYX_SUBMODEL_REPOSITORY_HC_URL}
      AppSettings__InitialConceptDescriptionRepositoryUrl: \${BASYX_CONCEPT_DESCRIPTION_REPOSITORY_URL}
      AppSettings__InitialConceptDescriptionRepositoryVersion: \${CONCEPT_DESCRIPTION_REPOSITORY_IMAGE_TAG}
      AppSettings__InitialConceptDescriptionRepositoryContainer: \${BASYX_CONCEPT_DESCRIPTION_REPOSITORY_CONTAINER}
      AppSettings__InitialConceptDescriptionRepositoryContainerPort: \${BASYX_CONCEPT_DESCRIPTION_REPOSITORY_CONTAINER_PORT}
      AppSettings__InitialConceptDescriptionRepositoryHcUrl: \${BASYX_CONCEPT_DESCRIPTION_REPOSITORY_HC_URL}
      AppSettings__SingleTenantMode: "true"
      AppSettings__HandleInitialInfrastructureAsInternal: \${BASYX_HANDLE_AS_INTERNAL}
      EmailConfiguration__SmtpServer: \${SMTP_SERVER}
      EmailConfiguration__SmtpPort: \${SMTP_PORT}
      EmailConfiguration__SmtpUseSSL: \${SMTP_USE_SSL}
      EmailConfiguration__SmtpUseTLS: \${SMTP_USE_TLS}
      EmailConfiguration__SmtpNeedsAuthentication: \${SMTP_NEEDS_AUTHENTICATION}
      EmailConfiguration__SenderAddress: \${SENDER_ADDRESS}
      EmailConfiguration__SenderUsername: \${SENDER_USER}
      EmailConfiguration__SenderPassword: \${SENDER_PASSWORD}
      EmailConfiguration__NewOrgaNotificationAddress: \${NEW_ORGA_NOTIFICATION_ADDRESS}
      EmailConfiguration__SubjectPrefix: \${SUBJECT_PREFIX}
EOF_COMPOSE

  if [ "$include_enterprise_licensing" = "true" ]; then
    cat >> "$compose_file" <<EOF_COMPOSE
      AppSettings__LicenseFilePath: /run/secrets/licensing/license.json
      AppSettings__LicenseName: \${LICENSE_NAME}
      AppSettings__LicensePublicKeyPath: /run/secrets/licensing/license-public.pem
EOF_COMPOSE
  fi

  cat >> "$compose_file" <<EOF_COMPOSE
    networks:
      - ${network_name}
EOF_COMPOSE

  if [ "$include_enterprise_licensing" = "true" ]; then
    cat >> "$compose_file" <<EOF_COMPOSE
    volumes:
      - \${LICENSE_DIR_PATH}:/run/secrets/licensing
EOF_COMPOSE
  fi

  cat >> "$compose_file" <<EOF_COMPOSE
    depends_on:
      postgres:
        condition: service_healthy
EOF_COMPOSE

  if [ "$keycloak_mode" = "install" ]; then
    cat >> "$compose_file" <<EOF_COMPOSE
      keycloak:
        condition: service_healthy
EOF_COMPOSE
  fi

  cat >> "$compose_file" <<EOF_COMPOSE
    healthcheck:
      test: ["CMD-SHELL", "if command -v curl >/dev/null 2>&1; then curl -fsS http://127.0.0.1:${container_port}/api/hc >/dev/null || exit 1; else kill -0 1; fi"]
      interval: 10s
      timeout: 5s
      retries: 12
      start_period: 30s
    restart: unless-stopped
EOF_COMPOSE
}

append_feedmapping_service() {
  local compose_file="$1"
  local network_name="$2"
  local container_port="$3"
  local include_enterprise_licensing="${4:-false}"

  cat >> "$compose_file" <<EOF_COMPOSE
  feedmapping:
    image: \${FEEDMAPPING_IMAGE_REPO}:\${FEEDMAPPING_IMAGE_TAG}
    container_name: \${PROJECT_NAME}-feedmapping
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:${container_port}
      ConnectionStrings__DefaultConnection: Host=postgres;Port=5432;Database=\${POSTGRES_DB};Username=\${POSTGRES_USER};Password=\${POSTGRES_PASSWORD}
      AppSettings__Issuer: \${APP_JWT_ISSUER:-vws-portal}
      AppSettings__Salt: \${APP_JWT_SALT:-ja1nnNyDKoiTYu3LaBQ/9A==}
      AppSettings__Secret: \${APP_JWT_SECRET:-wik3RnSNPAPt85PFs9FZSQksdoughzfoafdt879uiaodfnbiezv79si90dpoawlcv}
EOF_COMPOSE

  if [ "$include_enterprise_licensing" = "true" ]; then
    cat >> "$compose_file" <<EOF_COMPOSE
      AppSettings__LicenseFilePath: /run/secrets/licensing/license.json
      AppSettings__LicensePublicKeyPath: /run/secrets/licensing/license-public.pem
EOF_COMPOSE
  fi

  cat >> "$compose_file" <<EOF_COMPOSE
    networks:
      - ${network_name}
EOF_COMPOSE

  if [ "$include_enterprise_licensing" = "true" ]; then
    cat >> "$compose_file" <<EOF_COMPOSE
    volumes:
      - \${LICENSE_DIR_PATH}:/run/secrets/licensing
EOF_COMPOSE
  fi

  cat >> "$compose_file" <<EOF_COMPOSE
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
EOF_COMPOSE
}

append_basyx_internal_services() {
  local compose_file="$1"
  local network_name="$2"

  cat >> "$compose_file" <<EOF_COMPOSE
  aasregistry-go:
    image: \${AAS_REGISTRY_IMAGE_REPO}:\${AAS_REGISTRY_IMAGE_TAG}
    container_name: \${PROJECT_NAME}-aasregistry-go
    ports:
      - "\${AAS_REGISTRY_HOST_PORT}:\${AASREG_SERVER_PORT}"
    environment:
      CORS_ALLOWEDORIGINS: \${AASREG_CORS_ALLOWEDORIGINS}
      CORS_ALLOWEDHEADERS: \${AASREG_CORS_ALLOWEDHEADERS}
      CORS_ALLOWEDCREDENTIALS: \${AASREG_CORS_ALLOWEDCREDENTIALS}
      CORS_ALLOWEDMETHODS: \${AASREG_CORS_ALLOWEDMETHODS}
      VIRTUAL_PORT: \${AASREG_VIRTUAL_PORT}
      SERVER_PORT: \${AASREG_SERVER_PORT}
      POSTGRES_HOST: \${AASREG_POSTGRES_HOST}
      POSTGRES_PORT: \${AASREG_POSTGRES_PORT}
      POSTGRES_USER: \${AASREG_POSTGRES_USER}
      POSTGRES_PASSWORD: \${AASREG_POSTGRES_PASSWORD}
      POSTGRES_DBNAME: \${AASREG_POSTGRES_DBNAME}
      POSTGRES_MAXOPENCONNECTIONS: \${AASREG_POSTGRES_MAXOPENCONNECTIONS}
      POSTGRES_MAXIDLECONNECTIONS: \${AASREG_POSTGRES_MAXIDLECONNECTIONS}
      POSTGRES_CONNMAXLIFETIMEMINUTES: \${AASREG_POSTGRES_CONNMAXLIFETIMEMINUTES}
      ABAC_ENABLED: \${AASREG_ABAC_ENABLED}
      ABAC_MODELPATH: \${AASREG_ABAC_MODELPATH}
      OIDC_TRUSTLISTPATH: \${AASREG_OIDC_TRUSTLISTPATH}
    volumes:
      - ./${STACK_ASSETS_DIR_NAME}/security_env:/security_env
    networks:
      - ${network_name}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  submodelregistry-go:
    image: \${SUBMODEL_REGISTRY_IMAGE_REPO}:\${SUBMODEL_REGISTRY_IMAGE_TAG}
    container_name: \${PROJECT_NAME}-submodelregistry-go
    ports:
      - "\${SUBMODEL_REGISTRY_HOST_PORT}:\${SMREG_SERVER_PORT}"
    environment:
      CORS_ALLOWEDORIGINS: \${SMREG_CORS_ALLOWEDORIGINS}
      CORS_ALLOWEDHEADERS: \${SMREG_CORS_ALLOWEDHEADERS}
      CORS_ALLOWEDCREDENTIALS: \${SMREG_CORS_ALLOWEDCREDENTIALS}
      CORS_ALLOWEDMETHODS: \${SMREG_CORS_ALLOWEDMETHODS}
      VIRTUAL_PORT: \${SMREG_VIRTUAL_PORT}
      SERVER_PORT: \${SMREG_SERVER_PORT}
      POSTGRES_HOST: \${SMREG_POSTGRES_HOST}
      POSTGRES_PORT: \${SMREG_POSTGRES_PORT}
      POSTGRES_USER: \${SMREG_POSTGRES_USER}
      POSTGRES_PASSWORD: \${SMREG_POSTGRES_PASSWORD}
      POSTGRES_DBNAME: \${SMREG_POSTGRES_DBNAME}
      POSTGRES_MAXOPENCONNECTIONS: \${SMREG_POSTGRES_MAXOPENCONNECTIONS}
      POSTGRES_MAXIDLECONNECTIONS: \${SMREG_POSTGRES_MAXIDLECONNECTIONS}
      POSTGRES_CONNMAXLIFETIMEMINUTES: \${SMREG_POSTGRES_CONNMAXLIFETIMEMINUTES}
      ABAC_ENABLED: \${SMREG_ABAC_ENABLED}
      ABAC_MODELPATH: \${SMREG_ABAC_MODELPATH}
      OIDC_TRUSTLISTPATH: \${SMREG_OIDC_TRUSTLISTPATH}
    volumes:
      - ./${STACK_ASSETS_DIR_NAME}/security_env:/security_env
    networks:
      - ${network_name}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  aasdiscovery-go:
    image: \${AAS_DISCOVERY_IMAGE_REPO}:\${AAS_DISCOVERY_IMAGE_TAG}
    container_name: \${PROJECT_NAME}-aasdiscovery-go
    ports:
      - "\${AAS_DISCOVERY_HOST_PORT}:\${AASDISC_SERVER_PORT}"
    environment:
      CORS_ALLOWEDORIGINS: \${AASDISC_CORS_ALLOWEDORIGINS}
      CORS_ALLOWEDHEADERS: \${AASDISC_CORS_ALLOWEDHEADERS}
      CORS_ALLOWEDCREDENTIALS: \${AASDISC_CORS_ALLOWEDCREDENTIALS}
      CORS_ALLOWEDMETHODS: \${AASDISC_CORS_ALLOWEDMETHODS}
      VIRTUAL_PORT: \${AASDISC_VIRTUAL_PORT}
      SERVER_PORT: \${AASDISC_SERVER_PORT}
      POSTGRES_HOST: \${AASDISC_POSTGRES_HOST}
      POSTGRES_PORT: \${AASDISC_POSTGRES_PORT}
      POSTGRES_USER: \${AASDISC_POSTGRES_USER}
      POSTGRES_PASSWORD: \${AASDISC_POSTGRES_PASSWORD}
      POSTGRES_DBNAME: \${AASDISC_POSTGRES_DBNAME}
      POSTGRES_MAXOPENCONNECTIONS: \${AASDISC_POSTGRES_MAXOPENCONNECTIONS}
      POSTGRES_MAXIDLECONNECTIONS: \${AASDISC_POSTGRES_MAXIDLECONNECTIONS}
      POSTGRES_CONNMAXLIFETIMEMINUTES: \${AASDISC_POSTGRES_CONNMAXLIFETIMEMINUTES}
      ABAC_ENABLED: \${AASDISC_ABAC_ENABLED}
      ABAC_MODELPATH: \${AASDISC_ABAC_MODELPATH}
      OIDC_TRUSTLISTPATH: \${AASDISC_OIDC_TRUSTLISTPATH}
    volumes:
      - ./${STACK_ASSETS_DIR_NAME}/security_env:/security_env
    networks:
      - ${network_name}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  aasrepository-go:
    image: \${AAS_REPOSITORY_IMAGE_REPO}:\${AAS_REPOSITORY_IMAGE_TAG}
    container_name: \${PROJECT_NAME}-aasrepository-go
    ports:
      - "\${AAS_REPOSITORY_HOST_PORT}:\${AASREPO_SERVER_PORT}"
    environment:
      CORS_ALLOWEDORIGINS: \${AASREPO_CORS_ALLOWEDORIGINS}
      CORS_ALLOWEDHEADERS: \${AASREPO_CORS_ALLOWEDHEADERS}
      CORS_ALLOWEDCREDENTIALS: \${AASREPO_CORS_ALLOWEDCREDENTIALS}
      CORS_ALLOWEDMETHODS: \${AASREPO_CORS_ALLOWEDMETHODS}
      SERVER_PORT: \${AASREPO_SERVER_PORT}
      POSTGRES_HOST: \${AASREPO_POSTGRES_HOST}
      POSTGRES_PORT: \${AASREPO_POSTGRES_PORT}
      POSTGRES_USER: \${AASREPO_POSTGRES_USER}
      POSTGRES_PASSWORD: \${AASREPO_POSTGRES_PASSWORD}
      POSTGRES_DBNAME: \${AASREPO_POSTGRES_DBNAME}
      POSTGRES_MAXOPENCONNECTIONS: \${AASREPO_POSTGRES_MAXOPENCONNECTIONS}
      POSTGRES_MAXIDLECONNECTIONS: \${AASREPO_POSTGRES_MAXIDLECONNECTIONS}
      POSTGRES_CONNMAXLIFETIMEMINUTES: \${AASREPO_POSTGRES_CONNMAXLIFETIMEMINUTES}
      ABAC_ENABLED: \${AASREPO_ABAC_ENABLED}
      ABAC_MODELPATH: \${AASREPO_ABAC_MODELPATH}
      OIDC_TRUSTLISTPATH: \${AASREPO_OIDC_TRUSTLISTPATH}
    volumes:
      - ./${STACK_ASSETS_DIR_NAME}/security_env:/security_env
    networks:
      - ${network_name}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  submodelrepository-go:
    image: \${SUBMODEL_REPOSITORY_IMAGE_REPO}:\${SUBMODEL_REPOSITORY_IMAGE_TAG}
    container_name: \${PROJECT_NAME}-submodelrepository-go
    ports:
      - "\${SUBMODEL_REPOSITORY_HOST_PORT}:\${SMREPO_SERVER_PORT}"
    environment:
      CORS_ALLOWEDORIGINS: \${SMREPO_CORS_ALLOWEDORIGINS}
      CORS_ALLOWEDHEADERS: \${SMREPO_CORS_ALLOWEDHEADERS}
      CORS_ALLOWEDCREDENTIALS: \${SMREPO_CORS_ALLOWEDCREDENTIALS}
      CORS_ALLOWEDMETHODS: \${SMREPO_CORS_ALLOWEDMETHODS}
      SERVER_PORT: \${SMREPO_SERVER_PORT}
      POSTGRES_HOST: \${SMREPO_POSTGRES_HOST}
      POSTGRES_PORT: \${SMREPO_POSTGRES_PORT}
      POSTGRES_USER: \${SMREPO_POSTGRES_USER}
      POSTGRES_PASSWORD: \${SMREPO_POSTGRES_PASSWORD}
      POSTGRES_DBNAME: \${SMREPO_POSTGRES_DBNAME}
      POSTGRES_MAXOPENCONNECTIONS: \${SMREPO_POSTGRES_MAXOPENCONNECTIONS}
      POSTGRES_MAXIDLECONNECTIONS: \${SMREPO_POSTGRES_MAXIDLECONNECTIONS}
      POSTGRES_CONNMAXLIFETIMEMINUTES: \${SMREPO_POSTGRES_CONNMAXLIFETIMEMINUTES}
      ABAC_ENABLED: \${SMREPO_ABAC_ENABLED}
      ABAC_MODELPATH: \${SMREPO_ABAC_MODELPATH}
      OIDC_TRUSTLISTPATH: \${SMREPO_OIDC_TRUSTLISTPATH}
      JWS_PRIVATEKEYPATH: \${SMREPO_JWS_PRIVATEKEYPATH}
    volumes:
      - ./${STACK_ASSETS_DIR_NAME}/security_env:/security_env
    networks:
      - ${network_name}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  conceptdescriptionrepository-go:
    image: \${CONCEPT_DESCRIPTION_REPOSITORY_IMAGE_REPO}:\${CONCEPT_DESCRIPTION_REPOSITORY_IMAGE_TAG}
    container_name: \${PROJECT_NAME}-conceptdescriptionrepository-go
    ports:
      - "\${CONCEPT_DESCRIPTION_REPOSITORY_HOST_PORT}:\${CDREPO_SERVER_PORT}"
    environment:
      CORS_ALLOWEDORIGINS: \${CDREPO_CORS_ALLOWEDORIGINS}
      CORS_ALLOWEDHEADERS: \${CDREPO_CORS_ALLOWEDHEADERS}
      CORS_ALLOWEDCREDENTIALS: \${CDREPO_CORS_ALLOWEDCREDENTIALS}
      CORS_ALLOWEDMETHODS: \${CDREPO_CORS_ALLOWEDMETHODS}
      SERVER_PORT: \${CDREPO_SERVER_PORT}
      POSTGRES_HOST: \${CDREPO_POSTGRES_HOST}
      POSTGRES_PORT: \${CDREPO_POSTGRES_PORT}
      POSTGRES_USER: \${CDREPO_POSTGRES_USER}
      POSTGRES_PASSWORD: \${CDREPO_POSTGRES_PASSWORD}
      POSTGRES_DBNAME: \${CDREPO_POSTGRES_DBNAME}
      POSTGRES_MAXOPENCONNECTIONS: \${CDREPO_POSTGRES_MAXOPENCONNECTIONS}
      POSTGRES_MAXIDLECONNECTIONS: \${CDREPO_POSTGRES_MAXIDLECONNECTIONS}
      POSTGRES_CONNMAXLIFETIMEMINUTES: \${CDREPO_POSTGRES_CONNMAXLIFETIMEMINUTES}
      ABAC_ENABLED: \${CDREPO_ABAC_ENABLED}
      ABAC_MODELPATH: \${CDREPO_ABAC_MODELPATH}
      OIDC_TRUSTLISTPATH: \${CDREPO_OIDC_TRUSTLISTPATH}
    volumes:
      - ./${STACK_ASSETS_DIR_NAME}/security_env:/security_env
    networks:
      - ${network_name}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
EOF_COMPOSE
}

append_volumes_block() {
  local compose_file="$1"
  local postgres_volume_name="$2"

  cat >> "$compose_file" <<EOF_COMPOSE

volumes:
  ${postgres_volume_name}:
    driver: local
EOF_COMPOSE
}

append_networks_block() {
  local compose_file="$1"
  local network_name="$2"

  cat >> "$compose_file" <<EOF_COMPOSE

networks:
  ${network_name}:
    driver: bridge
EOF_COMPOSE
}

run_optional_startup() {
  local compose_file="$1"
  local env_file="$2"
  local run_config_check="$3"
  local run_start="$4"
  local image_source="${5:-remote}"
  local project_name="${6:-aas-suite}"

  if [ "$run_config_check" = "yes" ]; then
    info "Prüfe Compose-Konfiguration ..."
    docker compose -p "$project_name" --env-file "$env_file" -f "$compose_file" config >/dev/null
    info "Compose-Konfiguration ist gültig."
  fi

  if [ "$run_start" = "yes" ]; then
    pull_compose_images "$compose_file" "$env_file" "$project_name" "$image_source"
    info "Starte Stack ..."
    docker compose -p "$project_name" --env-file "$env_file" -f "$compose_file" up -d
    docker compose -p "$project_name" --env-file "$env_file" -f "$compose_file" ps
  fi
}

pull_compose_images() {
  local compose_file="$1"
  local env_file="$2"
  local project_name="$3"
  local image_source="${4:-remote}"
  local images
  local image
  local has_remote="no"
  local has_local="no"

  if [ "$image_source" = "local" ]; then
    info "Image-Quelle ist local: Überspringe docker compose pull."
    return 0
  fi

  if images="$(docker compose -p "$project_name" --env-file "$env_file" -f "$compose_file" config --images 2>/dev/null)"; then
    while IFS= read -r image; do
      [ -n "$image" ] || continue
      if [[ "$image" == *:local ]]; then
        has_local="yes"
        continue
      fi
      has_remote="yes"
      if ! docker pull "$image"; then
        warn "Image konnte nicht gezogen werden: $image (fahre fort)"
      fi
    done <<< "$(printf '%s\n' "$images" | sed '/^[[:space:]]*$/d' | sort -u)"

    if [ "$has_local" = "yes" ]; then
      info "Lokale Images (:local) erkannt: Pull für diese Images übersprungen."
    fi
    if [ "$has_remote" = "no" ]; then
      info "Keine Remote-Images zum Pullen gefunden."
    fi
    return 0
  fi

  info "Ziehe Images (docker compose pull) ..."
  if ! docker compose -p "$project_name" --env-file "$env_file" -f "$compose_file" pull --ignore-pull-failures; then
    warn "Image-Pull war nicht vollständig erfolgreich. Starte mit vorhandenen/lokalen Images weiter."
  fi
}
