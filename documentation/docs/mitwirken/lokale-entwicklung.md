---
sidebar_position: 2
title: Lokale Entwicklung
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
