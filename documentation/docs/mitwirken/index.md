---
sidebar_position: 1
title: Handbuch pflegen
---

# Handbuch pflegen

Das Handbuch liegt als Markdown im Repository unter `documentation/docs/` und
wird mit [Docusaurus](https://docusaurus.io/) gebaut. Jede Änderung auf `main`
wird automatisch gebaut und unter [docs.aas-suite.de](https://docs.aas-suite.de)
veröffentlicht; der Server übernimmt den neuen Stand spätestens am nächsten Tag.

## Wo gehört eine Seite hin?

| Ordner | Inhalt |
|---|---|
| `designer/` | Arbeit mit dem AAS Designer |
| `markt/` | Arbeit mit dem AAS Markt (nur Enterprise) |
| `betrieb/` | Installation, Konfiguration, Container |
| `betrieb/enterprise/` | Betriebsthemen, die nur die Enterprise-Edition betreffen |
| `mitwirken/` | Hinweise für Mitwirkende |

Weitere Komponenten bekommen einen eigenen Ordner auf oberster Ebene. Titel
und Reihenfolge in der Navigation steuern `sidebar_position` im Frontmatter
einer Seite und `_category_.json` in einem Ordner.

## Community- und Enterprise-Inhalte

Die Ordner `markt/` und `betrieb/enterprise/` gehören nur zur
Enterprise-Edition. Sie werden beim OSS-Export nicht mitkopiert und beim Build
mit `DOCS_EDITION=oss` ausgelassen. Seiten außerhalb dieser Ordner dürfen
deshalb nicht auf sie verlinken; der OSS-Build bricht sonst mit einem Fehler
ab.

Neue Ordner, die nur zur Enterprise-Edition gehören, müssen an zwei Stellen
eingetragen werden: `ENTERPRISE_ONLY` in `documentation/docusaurus.config.ts`
und `CUSTOM_EXCLUDES` in `tools/oss-export/oss-export.config`.

## Lokal ansehen

```bash
cd documentation
npm install
npm start
```

Die Vorschau läuft unter `http://localhost:3000` und aktualisiert sich bei
jeder Änderung.

Vor einem Commit:

```bash
npm run build
npm run build:oss
npm run check:topics
```

## Kontexthilfe aus der Anwendung

Der Button **Handbuch** in Designer und Markt öffnet die Seite, die zur
aktuellen Ansicht passt. Die Zuordnung von Anwendungs-URL zu Handbuchseite
steht im Frontend:

- Designer: `frontend/libs/designer-app-topbar/src/lib/designer-docs-context.ts`
- Markt: `frontend/apps/markt/src/app/markt-docs-context.ts`

Handbuchseiten werden dort immer über `docsTopic('designer/viewer')`
angegeben. `npm run check:topics` prüft, dass jede so referenzierte Seite
existiert. Wird eine Seite umbenannt oder verschoben, die Zuordnung im
Frontend mit anpassen.

## Screenshots

Bilder liegen unter `documentation/static/img/<bereich>/` und werden mit
`![Beschreibung](/img/designer/beispiel.png)` eingebunden.

Die Screenshots des Designers erzeugt ein Skript gegen einen laufenden
Designer (Standard `http://localhost:5196/designer-ui/`, abweichend über
`BASE_URL`). Es braucht ein installiertes Google Chrome.

```bash
cd documentation
npm run screenshots:login   # einmalig: Chrome öffnet sich, anmelden
npm run screenshots         # alle Bilder neu erzeugen
npm run screenshots -- editor viewer   # nur einzelne Abschnitte
```

Die Sitzung wird lokal unter `scripts/screenshots/.auth/` gespeichert und
nicht eingecheckt. Das Skript legt bei Bedarf Demo-Daten an: die AAS
`demoKreiselpumpeKp200`, die Typ-AAS `demoKreiselpumpeTypKp200`, die Adresse
„Demo Pumpen GmbH“ und den Schnipsel „Demo-Allgemeine Angaben“. Die Abläufe
stehen in
`scripts/screenshots/capture.mjs`. Ändert sich die Oberfläche, dort die
Schritte anpassen und die Bilder neu erzeugen.

:::warning Datenschutz
Screenshots dürfen keine personenbezogenen oder vertraulichen Daten zeigen.
Nur Demo-Daten mit erfundenen Werten verwenden. Profil und Organisationen nur
mit einem Demo-Konto aufnehmen, Benutzerverwaltung und Einladungen gar nicht,
und jedes neue Bild vor dem Commit ansehen. Das
Skript macht Profilbild und Organisationslogo zusätzlich unkenntlich.
:::
