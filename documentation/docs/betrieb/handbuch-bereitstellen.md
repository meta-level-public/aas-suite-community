---
sidebar_position: 4
title: Handbuch bereitstellen
description: Das Handbuch als Container betreiben und in Designer und Markt über DOCS_BASE_URL verlinken.
stichworte:
  Handbuch-Container: container-image
  aas-suite-docs: container-image
  DOCS_BASE_URL: handbuch-in-designer-und-markt-verlinken
  FRONTEND_DOCS_BASE_URL: handbuch-in-designer-und-markt-verlinken
  MARKT_DOCS_BASE_URL: handbuch-in-designer-und-markt-verlinken
  Kontexthilfe: handbuch-in-designer-und-markt-verlinken
quellen:
  - documentation/Dockerfile
  - documentation/Caddyfile
  - .github/workflows/docs.yml
  - frontend/libs/common-services/src/lib/user-docs.service.ts
  - frontend/libs/common-services/src/lib/app-config.ts
  - frontend/libs/common-components/src/lib/docs-link/docs-link.component.ts
  - frontend/libs/designer-app-topbar/src/lib/app-topbar/app-topbar.component.ts
  - frontend/apps/markt/src/app/footer/markt-footer.component.ts
  - docker-oss/docker-compose.yml
  - docker-oss/frontend-entrypoint.sh
  - docker-enterprise/docker-compose.yml
  - docker-enterprise/markt-ui-entrypoint.sh
  - tools/docker-compose-wizard/lib/common.sh
---

# Handbuch bereitstellen

Das Handbuch ist eine statische Website. Es wird unabhängig von den Releases
der Suite gebaut und veröffentlicht, damit Korrekturen und neue Seiten sofort
verfügbar sind.

## Container-Image

Das Image `aas-suite-docs` liefert das Handbuch über Caddy auf Port 80 aus:

```yaml
services:
  docs:
    image: <registry>/aas-suite-docs:latest
    ports:
      - '8090:80'
```

Das Tag `latest` zeigt immer auf den neuesten Stand des Handbuchs.

## Handbuch in Designer und Markt verlinken

Verweise auf das Handbuch erscheinen nur, wenn eine Adresse für das Handbuch
konfiguriert ist:

| Komponente | Umgebungsvariable des Frontend-Containers | Beispiel |
|---|---|---|
| AAS Designer | `FRONTEND_DOCS_BASE_URL` | `https://docs.example.com` |
| AAS Markt | `MARKT_DOCS_BASE_URL` | `https://docs.example.com` |

Alternativ kann der Wert als `docsBaseUrl` in `config/app-config.json` der
jeweiligen Anwendung stehen; die Umgebungsvariable hat Vorrang.

### In Stacks aus dem Compose-Wizard

In Stacks aus dem Compose-Wizard und in den Compose-Dateien unter
`docker-oss/` und `docker-enterprise/` werden beide Variablen aus **einer**
Variable `DOCS_BASE_URL` befüllt. Ohne Eintrag in der `.env` zeigt sie auf
das öffentliche Handbuch `https://docs.aas-suite.de`. Es beschreibt immer den
neuesten Stand der Suite, nicht unbedingt den der eigenen Installation.

Um ein eigenes Handbuch zu verlinken oder die Verweise abzuschalten:

1. In der `.env` des Stacks die Zeile ergänzen, z. B.
   `DOCS_BASE_URL=https://docs.example.com` für einen eigenen
   Handbuch-Container oder `DOCS_BASE_URL=` (leer), um alle Verweise
   auszublenden.
2. Die Frontend-Container neu erzeugen, z. B. mit `docker compose up -d`.
   Die Adresse wird beim Start des Containers übernommen.

Dann gibt es:

- den Button **Handbuch** in der Kopfleiste. Er öffnet die zur aktuellen
  Ansicht passende Seite in einem neuen Tab, z. B. im Viewer die Seite
  [Viewer](../designer/viewer.md),
- im Designer den Eintrag **Handbuch** im Benutzermenü und im Markt einen
  Link in der Fußzeile, jeweils zur Startseite,
- Links **Mehr dazu im Handbuch** in einzelnen Dialogen, z. B. beim Anlegen
  eines Tokens oder beim Einrichten einer Änderungsmitteilung.

Ohne Adresse fehlen diese Verweise ganz. Ob das Handbuch tatsächlich
erreichbar ist, prüft die Anwendung nicht. Installationen ohne Zugang zum
Internet setzen deshalb eine eigene Adresse oder lassen `DOCS_BASE_URL` leer.
