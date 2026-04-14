# OSS Documentation

Diese Dokumentation beschreibt die OSS-Variante des Portals.

## Inhalt

- Docker Compose Deployment: [docker-oss/DOCKER_README.md](/Users/christina/_DEV/ML/vws-portal/docker-oss/DOCKER_README.md)
- Docker-Compose-Generator (OSS): [tools/docker-compose-wizard/oss/README.md](/Users/christina/_DEV/ML/vws-portal/tools/docker-compose-wizard/oss/README.md)

## Abgrenzung

`docs-oss/` enthaelt nur Inhalte, die in der Open-Source-Variante verfuegbar oder fuer den OSS-Export relevant sind.

Das gemeinsame Root-Deployment unter [deploy/README.md](/Users/christina/_DEV/ML/vws-portal/deploy/README.md) ist bewusst nicht Teil dieser OSS-Doku, weil es aktuell ein zentrales Dev-Setup fuer das Gesamtprojekt beschreibt.

Der empfohlene Deployment-Pfad fuer OSS ist ein ueber den Wizard erzeugter portabler Stack mit `docker-compose`, `.env`, `stack-assets/` und `postgres-init/`.
