---
sidebar_position: 1
title: Überblick
---

# Betrieb und Administration

Dieser Bereich richtet sich an alle, die die AAS Suite installieren und
betreiben.

## Empfohlener Installationsweg

Für beide Editionen wird ein portabler Stack mit dem Docker-Compose-Wizard
erzeugt. Er besteht aus `docker-compose.yml`, `.env`, `stack-assets/` und
`postgres-init/`.

- Community (OSS): `tools/docker-compose-wizard/oss/create-compose-oss.sh`
  bzw. `create-compose-oss-non-interactive.sh` im Repository. Ohne
  Repository-Checkout steht der Wizard als `docker-compose-wizard-oss.zip` im
  jeweils neuesten Release des Community-Repositorys bereit.
- Die Docker-Artefakte liegen in `docker-oss/` (Community) bzw.
  `docker-enterprise/` (Enterprise).

## Weitere Themen

- [Container-Images und Versionen](./container-images.md)
- [Konfiguration](./konfiguration.md)
- [Handbuch bereitstellen](./handbuch-bereitstellen.md)
