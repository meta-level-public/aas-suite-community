# Stage 1: Build the Angular application
FROM node:22-alpine AS builder

RUN apk upgrade --no-cache

WORKDIR /app

# Copy source code
COPY frontend/ ./

# Install dependencies
RUN corepack enable && CI=true corepack pnpm install

# Build metadata injected by CI
ARG VERSION=dev
ARG BUILD_DATE=unknown
ARG BRANCH=local

# Write version.json so the app can display build info at runtime
RUN printf '{"version":"%s","date":"%s","branch":"%s","edition":"Community Edition"}' \
    "${VERSION}" "${BUILD_DATE}" "${BRANCH}" \
    > apps/aas-designer-community/public/version.json

# Build the application
RUN corepack pnpm nx build aas-designer-community --configuration production

# Stage 2: Serve with Caddy
FROM caddy:2-alpine

# Copy built files from builder
COPY --from=builder /app/dist/apps/aas-designer-community/browser/ /usr/share/caddy/

# Copy Caddyfile
COPY docker-oss/Caddyfile /etc/caddy/Caddyfile
COPY docker-oss/frontend-entrypoint.sh /usr/local/bin/frontend-entrypoint.sh
RUN chmod +x /usr/local/bin/frontend-entrypoint.sh

EXPOSE 80

CMD ["/usr/local/bin/frontend-entrypoint.sh"]
