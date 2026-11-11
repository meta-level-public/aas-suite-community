# AAS Suite Handbuch

Nutzer- und Betriebsdokumentation der AAS Suite, gebaut mit [Docusaurus](https://docusaurus.io/).
Die Inhalte liegen als Markdown unter `docs/`. Wie das Handbuch aufgebaut ist und gepflegt wird,
beschreibt die Seite `docs/mitwirken/index.md`.

## Befehle

| Befehl | Beschreibung |
|---|---|
| `npm install` | Abhängigkeiten installieren |
| `npm start` | Vorschau mit Live-Reload unter http://localhost:3000 |
| `npm run build` | Vollständiges Handbuch (Enterprise) nach `build/` |
| `npm run build:oss` | Handbuch ohne Enterprise-Seiten nach `build-oss/` |
| `npm run check:topics` | Prüft, dass alle Handbuchseiten existieren, die das Frontend über `docsTopic('...')` verlinkt |
| `npm run typecheck` | TypeScript-Prüfung der Konfiguration |

Die Suche funktioniert nur im Build (`npm run build && npm run serve`), nicht in `npm start`.

## Umgebungsvariablen beim Build

| Variable | Bedeutung |
|---|---|
| `DOCS_EDITION` | `oss` lässt `markt/` und `betrieb/enterprise/` weg, sonst alle Seiten |
| `DOCS_SITE_URL` | Öffentliche Adresse für Sitemap und kanonische Links |
| `DOCS_BASE_PATH` | Pfad, unter dem das Handbuch ausgeliefert wird (Standard `/`) |
| `DOCS_EDIT_URL` | Optional: Basis für den Link „Diese Seite bearbeiten“, z. B. `https://github.com/<org>/<repo>/edit/main/documentation/` |

## Veröffentlichung

`.github/workflows/docs.yml` prüft jede Änderung und baut bei jedem Push auf `main` das Image
`aas-suite-docs` (Caddy, Port 80) mit den Tags `latest` und `sha-<commit>`. Das Handbuch ist damit
unabhängig von den Releases der Suite. Die CI-Variablen `DOCS_SITE_URL` (Standard
`https://docs.aas-suite.de`) und `DOCS_EDIT_URL` werden an den Build übergeben.

Die öffentliche Fassung läuft unter https://docs.aas-suite.de auf demselben Server wie Designer und
Markt. Watchtower holt dort nachts das neue `latest`-Image; für eine sofortige Aktualisierung
`docker compose pull aas-suite-docs && docker compose up -d aas-suite-docs` ausführen.

Designer und Markt zeigen den Button „Handbuch“, sobald `FRONTEND_DOCS_BASE_URL` (Designer) bzw.
`MARKT_DOCS_BASE_URL` (Markt) gesetzt ist; in den Compose-Dateien unter `docker-oss/` und
`docker-enterprise/` geschieht das über `DOCS_BASE_URL`.
