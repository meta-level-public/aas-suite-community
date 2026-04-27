#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib/common.sh
source "$CURRENT_DIR/../lib/common.sh"
IMAGE_NAMESPACE="${IMAGE_NAMESPACE:-aas-suite}"
IMAGE_TAG="${IMAGE_TAG:-local}"

if ! command -v docker >/dev/null 2>&1; then
  die "docker wurde nicht gefunden."
fi

if ! docker info >/dev/null 2>&1; then
  die "Docker Daemon ist nicht erreichbar."
fi

build_image() {
  local image="$1"
  local dockerfile="$2"

  info "Baue ${image} aus ${dockerfile}"
  docker build \
    -f "${ROOT_DIR}/${dockerfile}" \
    -t "${image}" \
    "${ROOT_DIR}"
}

header "Lokale Docker Images bauen (OSS/Community)"
build_image "${IMAGE_NAMESPACE}/aas-designer-backend-community:${IMAGE_TAG}" "services/aas-designer/Dockerfile.community"
build_image "${IMAGE_NAMESPACE}/aas-designer-gateway:${IMAGE_TAG}" "services/gateway/Dockerfile"
build_image "${IMAGE_NAMESPACE}/aas-designer-frontend-community:${IMAGE_TAG}" "docker-oss/frontend.Dockerfile"

success "Lokale Images erfolgreich gebaut:"
printf '  - %s\n' "${IMAGE_NAMESPACE}/aas-designer-backend-community:${IMAGE_TAG}"
printf '  - %s\n' "${IMAGE_NAMESPACE}/aas-designer-gateway:${IMAGE_TAG}"
printf '  - %s\n' "${IMAGE_NAMESPACE}/aas-designer-frontend-community:${IMAGE_TAG}"
printf '\n'
info "Für den Compose Wizard 'Image-Quelle=local' verwenden."
