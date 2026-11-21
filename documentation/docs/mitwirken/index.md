---
sidebar_position: 1
title: Handbuch pflegen
description: Wie das Handbuch aufgebaut ist, wie Kapitel, Stichworte, Quellen und Screenshots gepflegt und geprüft werden.
stichworte:
  Frontmatter: aufbau-eines-kapitels
  Quellen (Frontmatter): aufbau-eines-kapitels
  Stichworte (Frontmatter): aufbau-eines-kapitels
  Edition (Community/Enterprise): community--und-enterprise-inhalte
  Kontexthilfe: kontexthilfe-aus-der-anwendung
  PDF des ganzen Handbuchs: ganzes-handbuch-als-pdf
  Screenshots erzeugen: screenshots
  Demo-Daten: screenshots
quellen:
  - documentation/docusaurus.config.ts
  - documentation/plugins/stichworte.ts
  - documentation/scripts/check-docs-topics.mjs
  - documentation/scripts/check-images.mjs
  - documentation/scripts/check-quellen.mjs
  - documentation/scripts/pdf.mjs
  - documentation/scripts/pdf.css
  - documentation/plugins/pdf.ts
  - documentation/scripts/screenshots/run.mjs
  - documentation/scripts/screenshots/seed/demo-daten.mjs
  - frontend/libs/designer-app-topbar/src/lib/designer-docs-context.ts
  - tools/oss-export/oss-export.config
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

## Aufbau eines Kapitels

Jedes Kapitel beginnt mit einem Frontmatter nach diesem Muster:

```yaml
---
sidebar_position: 8
title: Editor
description: Ein Satz, wozu die Seite dient (für Suche und Vorschau).
stichworte:
  Changelog: speichern
  Editor: ''
quellen:
  - frontend/libs/aas-designer-core/src/lib/editor/editor.component.html
  - frontend/libs/translations/i18n/de.json
---
```

- `stichworte` ordnet Begriffe einem Anker auf derselben Seite zu, also der
  ID einer Überschrift (`''` steht für den Seitenanfang). Daraus entsteht das
  [Stichwortverzeichnis](../stichworte.mdx). Existiert ein Anker nicht, bricht
  der Build ab. Seiten aus `markt/` und `betrieb/enterprise/` fehlen im
  Verzeichnis des OSS-Builds.
- `quellen` listet die Dateien, aus denen das Kapitel abgeleitet ist:
  Komponenten, Routen, Übersetzungen, Tests und Backend-Code, jeweils relativ
  zum Repository. Angezeigt wird die Liste nicht. Sie verbindet Code und
  Handbuch: `grep -rl <pfad> documentation/docs` findet die Kapitel, die eine
  Code-Änderung betrifft. `npm run check:quellen` prüft, dass jeder Pfad
  existiert.

Der Text beginnt mit einem Satz, wozu der Bereich dient. Abläufe stehen als
nummerierte Schritte, Bilder in eigenen Absätzen mit beschreibendem Alt-Text.
Sonderfälle, Rechte und Unterschiede zwischen Community- und
Enterprise-Edition stehen in Hinweisboxen (`:::note`, `:::tip`, `:::info`,
`:::warning`). Beschriftungen der Oberfläche werden wörtlich aus der deutschen
Übersetzungsdatei übernommen und fett gesetzt. Interne Bezeichner,
Komponenten- und Tabellennamen gehören nicht in den Text; nur Kapitel unter
`betrieb/` nennen Konfigurationsschlüssel.

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
npm run check:images
npm run check:quellen
```

## Kontexthilfe aus der Anwendung

Der Button **Handbuch** in Designer und Markt öffnet die Seite, die zur
aktuellen Ansicht passt, auf Wunsch direkt an einer Überschrift. Alle Ziele,
auf die die Anwendung verlinken darf, stehen typisiert an einer Stelle:
`DOCS_TARGETS` in `frontend/libs/common-services/src/lib/docs-targets.ts`
(Seite und erlaubte Anker). Die Zuordnung von Anwendungs-URL zu Ziel steht in:

- Designer: `frontend/libs/designer-app-topbar/src/lib/designer-docs-context.ts`
- Enterprise-Designer zusätzlich:
  `frontend/apps/aas-designer-enterprise/src/app/enterprise-docs-context.ts`
- Markt: `frontend/apps/markt/src/app/markt-docs-context.ts`

Ziele werden immer über `docsTopic('designer/organisation', 'token')`
angegeben; TypeScript lässt nur Seiten und Anker aus `DOCS_TARGETS` zu.
Links in Dialogen setzt die Komponente `lib-docs-link` mit demselben Ziel.
`npm run check:topics` prüft, dass jede Seite und jeder Anker aus
`DOCS_TARGETS` im Handbuch existiert. Der Anker ist die ID der Überschrift,
die Docusaurus erzeugt, oder eine feste ID wie `{#mehrfach-freigaben}`.

## Regeln für Änderungen an der Anwendung

- Bei jeder sichtbaren Änderung die betroffenen Kapitel über `quellen`
  suchen (`grep -rl <geänderter-pfad> documentation/docs`) und den Text in
  derselben Änderung anpassen.
- Ein neuer Bildschirm oder Dialog ist erst fertig, wenn es Kapiteltext,
  einen Eintrag in der Kontexthilfe, eine Aufnahme und die Demo-Daten dafür
  im Seed gibt.
- Seitenpfade und verlinkte Überschriften nicht umbenennen, ohne
  `DOCS_TARGETS`, interne Links und Stichwort-Anker in derselben Änderung
  mitzuziehen. Soll eine Überschrift umformuliert werden, ihren Anker mit
  `{#alte-id}` festhalten.
- Bilder bei größeren Oberflächenänderungen und vor jedem Release der Suite
  mit `npm run screenshots` neu erzeugen und jedes geänderte Bild ansehen.

## Ganzes Handbuch als PDF

Neben der Website entsteht je Edition ein PDF des ganzen Handbuchs: Deckblatt
mit Edition und Stand (Datum und Commit), Inhaltsverzeichnis mit
Seitenzahlen, alle Kapitel in der Reihenfolge der Seitenleiste und das
Stichwortverzeichnis. Verweise zwischen Kapiteln sind Sprünge im PDF und
nennen die Seitenzahl; die Lesezeichen entstehen aus den Überschriften.

```bash
npm run build && npm run pdf          # build/handbuch.pdf
npm run build:oss && npm run pdf:oss  # build-oss/handbuch.pdf
```

Das PDF wird nicht eingecheckt. Für Enterprise entsteht es beim Bau des
Images `aas-suite-docs` und wird unter `/handbuch.pdf` ausgeliefert; die CI
druckt zusätzlich die OSS-Edition zur Prüfung. Im Entwicklungsserver
(`npm start`) baut der Link **Ganzes Handbuch (PDF)** das PDF beim ersten
Aufruf im Hintergrund (Ordner `node_modules/.cache/handbuch-pdf/`), zeigt solange eine
Warteseite und baut erst nach einer Änderung an Kapiteln, Bildern oder Code
des Handbuchs neu. Scheitert der Lauf, zeigt die Seite die Ausgabe des Builds.

Für Kapitel, die gedruckt gut aussehen sollen:

- Bilder, Tabellen, Hinweisboxen und Code werden nicht über Seiten hinweg
  geteilt; sehr lange Tabellen deshalb vermeiden.
- Screenshots werden für den Druck auf 1400 px Breite verkleinert.
- Videos fehlen im PDF, ebenso die Seite „Videos“. Der Satz, der im Text auf
  ein Video hinführt, ist immer der letzte Satz des Absatzes vor dem Video und
  beginnt mit „Das Video zeigt“; das PDF lässt ihn weg.
- Inhalte, die nur auf die Website gehören, bekommen die Klasse
  `pdf-ausblenden`.

Druckstil: `scripts/pdf.css`, Ablauf: `scripts/pdf.mjs` (Seitenumbruch mit
Paged.js, gedruckt mit Chromium).

## Screenshots

Bilder liegen unter `documentation/static/img/<bereich>/` und werden mit
`![Beschreibung](/img/designer/beispiel.png)` eingebunden.

Kein Bild wird von Hand aufgenommen. Ein Befehl fährt eine frische
Wegwerf-Umgebung hoch (Gateway, APIs, Keycloak, BaSyx, Datenbanken, Designer,
bei Enterprise auch Markt), legt die Demo-Daten an, nimmt alle Bilder auf und
räumt die Umgebung samt Daten wieder ab:

```bash
cd documentation
npm run screenshots            # Enterprise, alle Bilder
npm run screenshots:oss        # Community-Edition, ohne Enterprise-Bilder
npm run screenshots:headed     # mit sichtbarem Browser
npm run screenshots -- editor  # nur passende Aufnahmen
```

Voraussetzungen sind Docker und ein installiertes Google Chrome. Der erste Lauf
baut die Images aus dem aktuellen Stand des Repositorys und dauert entsprechend
länger; `HANDBUCH_SKIP_BUILD=1` verwendet vorhandene Images. Für den
Enterprise-Lauf wird eine Test-Lizenz erwartet (Standard
`tmp/license-Demo-Designer.json`, abweichend über `HANDBUCH_LICENSE_FILE`); sie
wird nie eingecheckt.

Aufbau unter `scripts/screenshots/`:

| Datei | Inhalt |
|---|---|
| `stack.mjs` | Wegwerf-Umgebung über den Compose-Wizard, freie Ports, eigene Volumes |
| `stack/values.env` | Feste Testwerte der Umgebung, u. a. das Demo-Konto |
| `seed/demo-daten.mjs` | Demo-Daten der fiktiven „Demo Pumpen GmbH“ mit festen IDs |
| `seed/seed.mjs` | Legt die Demo-Daten über die APIs des Designers an |
| `specs/*.spec.mjs` | Eine Datei je Kapitel, ein Test je Bild oder Bildgruppe |
| `lib/shot.mjs` | Aufnahme mit Ausschnitt, nummerierten Markierungen und Bildregel |

Regeln für Aufnahmen:

- Bildnamen folgen `<bereich>/<thema>.png`. `npm run check:images` prüft, dass
  jedes eingebundene Bild von einer Aufnahme erzeugt wird und kein erzeugtes
  Bild verwaist ist.
- Selektoren bevorzugt über Rollen und sichtbare Beschriftungen aus
  `frontend/libs/translations/i18n/de.json`. Passt ein Selektor nicht mehr,
  scheitert der Lauf; das ist gewollt.
- Auf Zustände warten, nie auf feste Zeiten.
- Verändert eine Aufnahme Daten, nimmt sie die Änderung selbst zurück.
- Fehlen Demo-Daten für ein Bild, gehören sie in den Seed, nicht in die Aufnahme.
- Bildregel: Alles, was ein Bild zeigt oder markiert, steht ganz und
  unverdeckt im Bild. `shot()` bricht sonst mit einer Meldung ab. Braucht ein
  Bild mehr Platz, Leisten über die Option `hide` ausblenden statt das Ziel
  anzuschneiden.
- Markierungen (`marks`) tragen dieselben Nummern wie die Schritte im Kapiteltext.
- Aufnahmen nur für Enterprise bekommen `@enterprise` im Namen des
  `describe`-Blocks.

:::warning Datenschutz
Screenshots dürfen keine personenbezogenen oder vertraulichen Daten zeigen. Die
Wegwerf-Umgebung enthält nur das Demo-Konto und erfundene Demo-Daten. Trotzdem
jedes neue oder geänderte Bild vor dem Commit ansehen. Wo die Umgebung Fremdes
zeigen könnte, macht die Option `blur` von `shot()` es unkenntlich.
:::
