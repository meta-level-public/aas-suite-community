---
slug: /
sidebar_position: 1
title: Willkommen
description: Startseite des Handbuchs der AAS Suite – Bereiche, Editionen und Hilfe direkt in der Anwendung.
stichworte:
  Handbuch: ''
  Editionen: community-und-enterprise
  Community-Edition: community-und-enterprise
  Enterprise-Edition: community-und-enterprise
  Kontexthilfe: hilfe-in-der-anwendung
  Feldhilfen: hilfe-in-der-anwendung
quellen:
  - frontend/libs/common-components/src/lib/user-docs-button/user-docs-button.component.html
  - frontend/libs/designer-app-topbar/src/lib/designer-docs-context.ts
  - frontend/apps/markt/src/app/markt-docs-context.ts
  - frontend/apps/aas-designer-enterprise/src/app/app.config.ts
---

# AAS Suite Handbuch

Dieses Handbuch beschreibt die Arbeit mit der AAS Suite. Es richtet sich an
Anwenderinnen und Anwender, an Administratorinnen und Administratoren sowie an
alle, die an der Suite mitentwickeln.

## Bereiche

- **[AAS Designer](./designer/index.md)**: Verwaltungsschalen (AAS) anlegen,
  bearbeiten, anzeigen und teilen; Organisation, Rollen und Systemverwaltung.
- **[Betrieb und Administration](./betrieb/index.md)**: Installation,
  Konfiguration, Container-Images und Plugins.
- **[Mitwirken](./mitwirken/index.md)**: wie dieses Handbuch gepflegt wird
  und wie die lokale Entwicklungsumgebung aufgesetzt wird.

Wer zum ersten Mal mit Verwaltungsschalen arbeitet, beginnt mit den
[AAS-Grundlagen](./designer/grundlagen.md); Fachbegriffe erklärt das
[Glossar](./designer/glossar.md). Der [Schnellstart](./schnellstart.md) führt
in wenigen Schritten zur ersten AAS. Alle Begriffe von A bis Z stehen im
[Stichwortverzeichnis](./stichworte.mdx).

Das ganze Handbuch gibt es auch als [PDF zum Drucken](pathname:///handbuch.pdf).

## Community und Enterprise

Die AAS Suite gibt es als Community-Edition (Open Source) und als
Enterprise-Edition. Dieses Handbuch beschreibt beide. Funktionen, die es nur
in der Enterprise-Edition gibt, sind in den Kapiteln mit einem Hinweis
**Enterprise** gekennzeichnet.

:::info Enterprise
Zur Enterprise-Edition gehören unter anderem der **AAS Markt**, in dem
veröffentlichte AAS gefunden und abgerufen werden, das konfigurierbare
Dashboard, das Feed-Mapping, der KI-Assistent AASsi sowie weitere Themen für
den Betrieb. Die zugehörigen Kapitel sind nur im Handbuch der
Enterprise-Edition enthalten.
:::

## Hilfe in der Anwendung

In Designer und Markt öffnet der Button **Handbuch** (Fragezeichen-Symbol in
der Kopfleiste) die Seite dieses Handbuchs, die zur aktuellen Ansicht passt.
Der Button erscheint nur, wenn der Betrieb die Adresse des Handbuchs
konfiguriert hat, siehe
[Handbuch bereitstellen](./betrieb/handbuch-bereitstellen.md).

Zusätzlich gibt es an vielen Eingabefeldern kurze **Feldhilfen**. Sie werden
direkt in der Anwendung gepflegt, siehe [Feldhilfen](./designer/feldhilfen.md).

:::info Laufend aktualisiert
Das Handbuch wird unabhängig von den Releases der Suite gepflegt und
veröffentlicht. Es beschreibt den aktuellen Stand der Software.
:::
