# docker-oss

This directory contains the OSS/Community-specific Docker artifacts.

## Compose Files

Stacks for OSS/Community should be created using the Compose Wizard:

- interactive: `tools/docker-compose-wizard/oss/create-compose-oss.sh`
- non-interactive: `tools/docker-compose-wizard/oss/create-compose-oss-non-interactive.sh`

The generated files are placed by default in a folder such as `generated-stack-20260316153045/`. Inside, `docker-compose.yml`, `.env`, `stack-assets/` and `postgres-init/` together form the portable stack.

## Contents of this Directory

- `frontend.Dockerfile` for the Community frontend
- `.env.example` as an example for runtime values
- `docker-compose.yml` and `docker-compose.local.yml` as repository templates / reference
- Keycloak assets as the source for generated portable stacks

## DPP Gateway

Copy `.env.example` to `.env` and replace both placeholder secrets. The same
values provision the Keycloak service clients and configure the Designer and
the DPP Gateway. For the repository templates, start the base, local and DPP
security Compose files together:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.local.yml \
  -f docker-compose.dpp-security.yml \
  up -d --build
```

The public single-tenant DPP endpoint is exposed on port `5090` by default.

## Note

The backend service Dockerfiles are located centrally under `services/`.

## GUI Plugins

Place GUI plugin ZIP files in the repository-level `plugins/` folder when using this compose template. The backend mounts this directory read-only at `/app/plugins` and scans every ZIP for a root-level `manifest.json`. A plugin ZIP may contain a compiled static Angular app; its manifest route, for example `/my-plugin`, is exposed in the AAS Suite plugin area.
