---
sidebar_position: 2
title: Lokale Entwicklung
description: Lokale Entwicklungsumgebung der AAS Suite aufsetzen.
stichworte:
  Lokale Entwicklung: ''
  Handbuch-Button (lokal): handbuch-lokal-verbinden
quellen:
  - docker-oss/docker-compose.local.yml
  - docker-oss/docker-compose.yml
  - docker-oss/frontend-entrypoint.sh
  - docker-enterprise/docker-compose.yml
  - docker-enterprise/markt-ui-entrypoint.sh
  - frontend/libs/common-services/src/lib/user-docs.service.ts
---

# Lokale Entwicklung (Community-Version)

Das Repository enthält ein separates VS-Code-Workspace-Profil unter
`.vscode-oss/`, das auf die Community-Variante zugeschnitten ist.

1. Das Projekt in VS Code öffnen (Workspace-Root: Repository-Root).
2. Das Launch-Target **„Launch Community Stack“** starten. Es startet
   gleichzeitig:
   - den Gateway-Service,
   - die Designer-API (Community),
   - den Angular-Dev-Server der Community-Frontend-App.
3. Sobald alle drei Prozesse laufen, kann das Frontend-Debugging über das
   Launch-Target **„Debug AAS Designer Community (Chrome)“** gestartet werden.
   Es öffnet Chrome mit aktiviertem Source-Map-Debugging gegen
   `http://localhost:5196`.

## Handbuch lokal verbinden

Der Button **Handbuch** öffnet im lokalen Entwicklungsbetrieb den
Docusaurus-Server des Handbuchs, sodass neue Kapitel und die Kontexthilfe
zusammen geprüft werden können:

1. Das Handbuch starten:

   ```bash
   cd documentation
   npm start
   ```

   Es läuft unter `http://localhost:3000`.
2. Designer oder Markt mit dem Angular-Dev-Server (`nx serve`) starten. In
   Entwicklungs-Builds zeigt der Button ohne weitere Einstellung auf
   `http://localhost:3000`; ein in `app-config.json` gesetztes `docsBaseUrl`
   hat Vorrang. Produktions-Builds haben diesen Rückfall nicht.
3. Laufen die Oberflächen als Container (`docker-oss/` bzw.
   `docker-enterprise/`), in der `.env` neben der Compose-Datei
   `DOCS_BASE_URL=http://localhost:3000` setzen und die Container neu
   starten. Die Compose-Dateien reichen den Wert als `FRONTEND_DOCS_BASE_URL`
   an den Designer und als `MARKT_DOCS_BASE_URL` an den Markt weiter.

Ist keine Adresse gesetzt, blendet die Anwendung den Button aus.

