# docker-oss

This directory contains the OSS/Community-specific Docker artifacts.

## Compose Files

Stacks for OSS/Community should be created using the Compose Wizard:

- interactive: [tools/docker-compose-wizard/oss/create-compose-oss.sh](/Users/christina/_DEV/ML/vws-portal/tools/docker-compose-wizard/oss/create-compose-oss.sh)
- non-interactive: [tools/docker-compose-wizard/oss/create-compose-oss-non-interactive.sh](/Users/christina/_DEV/ML/vws-portal/tools/docker-compose-wizard/oss/create-compose-oss-non-interactive.sh)

The generated files are placed by default in a folder such as `generated-stack-20260316153045/`. Inside, `docker-compose.yml`, `.env`, `stack-assets/` and `postgres-init/` together form the portable stack.

## Contents of this Directory

- `frontend.Dockerfile` for the Community frontend
- `.env.example` as an example for runtime values
- `docker-compose.yml` and `docker-compose.local.yml` as repository templates / reference
- Keycloak assets as the source for generated portable stacks

## Note

The backend service Dockerfiles are located centrally under `services/`.

## GUI Plugins

Place GUI plugin ZIP files in the repository-level `plugins/` folder when using this compose template. The backend mounts this directory read-only at `/app/plugins` and scans every ZIP for a root-level `manifest.json`. A plugin ZIP may contain a compiled static Angular app; its manifest route, for example `/my-plugin`, is exposed in the AAS Suite plugin area.
