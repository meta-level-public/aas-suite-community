# Stage 1: Build the documentation site
FROM node:22-alpine AS builder

# Chromium und Schriften für das PDF des ganzen Handbuchs (scripts/pdf.mjs)
RUN apk upgrade --no-cache && apk add --no-cache chromium font-dejavu
ENV HANDBUCH_CHROMIUM=/usr/bin/chromium-browser

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# "enterprise" (all pages) or "oss" (without enterprise pages)
ARG DOCS_EDITION=enterprise
ARG DOCS_SITE_URL=http://localhost
ARG DOCS_EDIT_URL=
# Stand auf dem Deckblatt des PDF (im Image gibt es kein .git)
ARG DOCS_COMMIT=unbekannt
ENV DOCS_EDITION=${DOCS_EDITION} DOCS_SITE_URL=${DOCS_SITE_URL} DOCS_EDIT_URL=${DOCS_EDIT_URL} DOCS_COMMIT=${DOCS_COMMIT}

# Website und ganzes Handbuch als PDF (build/handbuch.pdf)
RUN npm run build && node scripts/pdf.mjs --build-dir build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine

RUN apk upgrade --no-cache

COPY --from=builder /app/build/ /usr/share/caddy/

COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
