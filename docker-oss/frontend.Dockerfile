# Stage 1: Build the Angular application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy source code
COPY frontend/ ./

# Install dependencies
RUN corepack enable && corepack pnpm install

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
