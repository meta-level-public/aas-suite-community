---
sidebar_position: 2
title: Container-Images und Versionen
description: Wo die Community-Images liegen, welche Tags es gibt und wie eine feste Version im Stack eingestellt wird.
stichworte:
  Container-Images: ''
  Image-Tags: ''
  latest: ''
  ARM64: ''
  Version festlegen: ''
  IMAGE_TAG: ''
quellen:
  - .github/workflows/ci.yml
  - docker-oss/docker-compose.yml
  - tools/docker-compose-wizard/lib/common.sh
  - tools/docker-compose-wizard/oss/create-compose-oss.sh
  - frontend/libs/designer-app-topbar/src/lib/app-topbar/app-topbar.component.ts
---

# Container-Images und Versionen

Die Community-Images werden unter
`ghcr.io/meta-level-public/aas-suite-community/<image>` veröffentlicht.
Verfügbare Tags:

- `1.4.2`: exakte Version eines Releases (Git-Tag `v1.4.2` im
  Community-Repository)
- `1.4` bzw. `1`: zeigt immer auf das neueste stabile Release dieser Minor-
  bzw. Major-Version; Vorabversionen wie `2.0.0-rc.1` verschieben diese Tags
  nicht
- `latest`: das zuletzt veröffentlichte stabile Release
- `main`, `release`, `sha-<commit>`: Entwicklungs- und Teststände
- ARM64-Images tragen jeweils das Suffix `-arm64`, z. B. `1.4.2-arm64`

Für produktive Installationen empfiehlt sich eine feste Version. `latest`
wechselt bei jedem Release automatisch und kann dabei
Datenbank-Migrationen auslösen.

- In Stacks aus dem Compose-Wizard steht die Version je Image in der
  `.env`, z. B. `DESIGNER_BACKEND_IMAGE_TAG`, `GATEWAY_IMAGE_TAG` und
  `FRONTEND_IMAGE_TAG`. Der Wizard schlägt standardmäßig die aktuelle
  Release-Version vor.
- Die Compose-Dateien unter `docker-oss/` verwenden eine gemeinsame
  Variable, z. B. `IMAGE_TAG=1.4.2` in der `.env`.

Die installierte Version steht im Benutzermenü des Designers (aus
`version.json` des Frontends).
