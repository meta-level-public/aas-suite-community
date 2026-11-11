# Stage 1: Build the documentation site
FROM node:22-alpine AS builder

RUN apk upgrade --no-cache

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# "enterprise" (all pages) or "oss" (without enterprise pages)
ARG DOCS_EDITION=enterprise
ARG DOCS_SITE_URL=http://localhost
ARG DOCS_EDIT_URL=
ENV DOCS_EDITION=${DOCS_EDITION} DOCS_SITE_URL=${DOCS_SITE_URL} DOCS_EDIT_URL=${DOCS_EDIT_URL}

RUN npm run build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine

RUN apk upgrade --no-cache

COPY --from=builder /app/build/ /usr/share/caddy/

COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
