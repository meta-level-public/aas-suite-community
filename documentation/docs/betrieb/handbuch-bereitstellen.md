---
sidebar_position: 4
title: Handbuch bereitstellen
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

Dann gibt es:

- den Button **Handbuch** in der Kopfleiste. Er öffnet die zur aktuellen
  Ansicht passende Seite in einem neuen Tab, z. B. im Viewer die Seite
  [Viewer](../designer/viewer.md),
- im Designer den Eintrag **Handbuch** im Benutzermenü und im Markt einen
  Link in der Fußzeile, jeweils zur Startseite,
- Links **Mehr dazu im Handbuch** in einzelnen Dialogen, z. B. beim Anlegen
  eines Tokens oder beim Einrichten einer Änderungsmitteilung.

Ohne Adresse fehlen diese Verweise ganz. Ob das Handbuch tatsächlich
erreichbar ist, prüft die Anwendung nicht. Läuft kein eigener
Handbuch-Container, die Variable also leer lassen.
