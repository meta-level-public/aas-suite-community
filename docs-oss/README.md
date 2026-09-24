# OSS Documentation

Diese Dokumentation beschreibt die OSS-Variante des Portals.

## Inhalt

- Docker Compose Deployment: [docker-oss/DOCKER_README.md](/Users/christina/_DEV/ML/vws-portal/docker-oss/DOCKER_README.md)
- Docker-Compose-Generator (OSS): [tools/docker-compose-wizard/oss/README.md](/Users/christina/_DEV/ML/vws-portal/tools/docker-compose-wizard/oss/README.md)

## Abgrenzung

`docs-oss/` enthaelt nur Inhalte, die in der Open-Source-Variante verfuegbar oder fuer den OSS-Export relevant sind.

Das gemeinsame Root-Deployment unter [deploy/README.md](/Users/christina/_DEV/ML/vws-portal/deploy/README.md) ist bewusst nicht Teil dieser OSS-Doku, weil es aktuell ein zentrales Dev-Setup fuer das Gesamtprojekt beschreibt.

Der empfohlene Deployment-Pfad fuer OSS ist ein ueber den Wizard erzeugter portabler Stack mit `docker-compose`, `.env`, `stack-assets/` und `postgres-init/`.

## Lokale Entwicklung (Community-Version)

Das Repository enthaelt ein separates VS Code-Workspace-Profil unter `.vscode-oss/`, das auf die Community-Variante zugeschnitten ist.

### Setup

1. Das Projekt in VS Code oeffnen (Workspace-Root: Repository-Root)
2. Das Launch-Target **"Launch Community Stack"** starten – dieses startet gleichzeitig:
   - den Gateway-Service
   - die Designer-API (Community)
   - den Angular Dev-Server der Community-Frontend-App
3. Sobald alle drei Prozesse laufen, kann das Frontend-Debugging ueber das Launch-Target **"Debug AAS Designer Community (Chrome)"** gestartet werden – dieses oeffnet Chrome mit aktiviertem Source-Map-Debugging gegen `http://localhost:5196`.

## Container-Images und Versionen

Die Community-Images werden unter `ghcr.io/meta-level-public/aas-suite-community/<image>` veröffentlicht. Verfügbare Tags:

- `1.4.2` – exakte Version eines Releases (Git-Tag `v1.4.2` im Community-Repository)
- `1.4` bzw. `1` – zeigt immer auf das neueste stabile Release dieser Minor- bzw. Major-Version; Vorabversionen wie `2.0.0-rc.1` verschieben diese Tags nicht
- `latest` – das zuletzt veröffentlichte stabile Release
- `main`, `release`, `sha-<commit>` – Entwicklungs- und Teststände
- ARM64-Images tragen jeweils das Suffix `-arm64`, z. B. `1.4.2-arm64`

Für produktive Installationen empfiehlt sich eine feste Version, z. B. `IMAGE_TAG=1.4.2` in der `.env` des Docker-Compose-Stacks; der Compose-Wizard schlägt standardmäßig die aktuelle Release-Version vor. `latest` wechselt bei jedem Release automatisch und kann dabei Datenbank-Migrationen auslösen. Die Version wird im Frontend über `version.json` angezeigt.
