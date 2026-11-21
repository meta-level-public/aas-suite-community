---
sidebar_position: 1
title: Überblick
description: Einstieg für Administration und IT – Installationsweg mit dem Docker-Compose-Wizard und Übersicht der Betriebsthemen.
stichworte:
  Installation: empfohlener-installationsweg
  Docker-Compose-Wizard: empfohlener-installationsweg
  Docker Compose: empfohlener-installationsweg
  Stack: ergebnis-des-wizards
  .env: ergebnis-des-wizards
  Betrieb: ''
quellen:
  - tools/docker-compose-wizard/README.md
  - tools/docker-compose-wizard/oss/create-compose-oss.sh
  - tools/docker-compose-wizard/oss/create-compose-oss-non-interactive.sh
  - tools/docker-compose-wizard/lib/common.sh
  - tools/docker-compose-wizard/package-wizard.sh
  - docker-oss/docker-compose.yml
---

# Betrieb und Administration

Dieser Bereich richtet sich an alle, die die AAS Suite installieren und
betreiben.

## Empfohlener Installationsweg

Für beide Editionen wird ein portabler Stack mit dem Docker-Compose-Wizard
erzeugt.

1. Wizard starten:
   - Community (OSS): `tools/docker-compose-wizard/oss/create-compose-oss.sh`
     (Fragen im Terminal) bzw. `create-compose-oss-non-interactive.sh`
     (Werte als `KEY=VALUE` oder per `--input <Datei>`, Übersicht mit
     `--help`) im Repository. Ohne
     Repository-Checkout steht der Wizard als `docker-compose-wizard-oss.zip`
     im jeweils neuesten Release des Community-Repositorys bereit.
2. Die Fragen beantworten, u. a. zu Keycloak, BaSyx und Ports. Keycloak und
   BaSyx bringt der Stack entweder selbst mit (`install`, Standard für BaSyx)
   oder bindet vorhandene Dienste an (`existing`).
3. Den erzeugten Ordner auf den Zielserver legen und dort mit
   `docker compose up -d` starten.

:::info Enterprise
Für die Enterprise-Edition gibt es einen eigenen Wizard mit zusätzlichen
Diensten. Er ist nicht Teil der Community-Edition.
:::

Die Docker-Artefakte für die Entwicklung liegen in `docker-oss/`
(Community) bzw. `docker-enterprise/` (Enterprise).

### Ergebnis des Wizards

Der Wizard legt einen neuen Ordner an, z. B.
`generated-stack-20260316153045/`, mit:

- `docker-compose.yml`
- `.env` mit allen Einstellungen des Stacks
- `stack-assets/` mit Zusatzdateien, z. B. für Keycloak
- `postgres-init/` mit den Skripten für die Datenbanken
- `plugins/` für [Plugins](./plugins.md)

Der Ordner ist in sich vollständig und kann an jedem Ort gestartet werden.
Spätere Anpassungen, z. B. die Adresse des Handbuchs, werden in der `.env`
vorgenommen.

## Weitere Themen

- [Container-Images und Versionen](./container-images.md)
- [Konfiguration](./konfiguration.md)
- [Handbuch bereitstellen](./handbuch-bereitstellen.md)
- [Plugins](./plugins.md)
