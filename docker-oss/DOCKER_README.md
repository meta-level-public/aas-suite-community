# docker-oss

Dieses Verzeichnis enthaelt die OSS-/Community-spezifischen Docker-Artefakte.

## Compose-Dateien

Stacks sollen fuer OSS/Community ueber den Compose-Wizard erzeugt werden:

- interaktiv: [tools/docker-compose-wizard/oss/create-compose-oss.sh](/Users/christina/_DEV/ML/vws-portal/tools/docker-compose-wizard/oss/create-compose-oss.sh)
- non-interactive: [tools/docker-compose-wizard/oss/create-compose-oss-non-interactive.sh](/Users/christina/_DEV/ML/vws-portal/tools/docker-compose-wizard/oss/create-compose-oss-non-interactive.sh)

Die erzeugten Dateien liegen standardmaessig in einem Ordner wie `generated-stack-20260316153045/`. Darin bilden `docker-compose.yml`, `.env`, `stack-assets/` und `postgres-init/` zusammen den portablen Stack.

## Inhalt dieses Ordners

- `frontend.Dockerfile` fuer das Community-Frontend
- `.env.example` als Beispiel fuer Runtime-Werte
- `docker-compose.yml` und `docker-compose.local.yml` als Repo-Vorlagen bzw. Referenz
- Keycloak-Assets als Quelle fuer generierte portable Stacks

## Hinweis

Die Backend-Service-Dockerfiles liegen zentral unter `services/`.
