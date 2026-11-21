---
sidebar_position: 1.5
title: Schnellstart
description: In wenigen Schritten zur ersten Verwaltungsschale – anmelden, im geführten Modus anlegen, speichern und weitergeben.
stichworte:
  Schnellstart: ''
  Erste AAS anlegen: erste-aas-anlegen
quellen:
  - frontend/libs/aas-designer-core/src/lib/generator/generator-flow.config.ts
  - frontend/libs/aas-designer-core/src/lib/generator/select-type/select-type.component.html
  - frontend/libs/aas-designer-core/src/lib/generator/save-and-confirm/save-and-confirm.component.html
  - frontend/libs/aas-designer-core/src/lib/generator/save-and-confirm/save-and-confirm.component.ts
  - frontend/libs/translations/i18n/de.json
  - documentation/scripts/screenshots/specs/aas-anlegen.spec.mjs
---

# Schnellstart

Dieser Schnellstart führt in wenigen Schritten zur ersten Verwaltungsschale
(AAS). Die Beispiele stammen von der fiktiven Demo Pumpen GmbH. Was eine AAS
ist und woraus sie besteht, erklären die [AAS-Grundlagen](./designer/grundlagen.md).

## Anmelden

1. Den AAS Designer im Browser öffnen und **Einloggen** wählen.
2. Mit dem Konto der eigenen Organisation anmelden.

Nach der Anmeldung zeigt der Designer die Startseite. Welche Menüpunkte
erscheinen, hängt von Rolle und Edition ab, siehe [Überblick](./designer/index.md).

## Erste AAS anlegen

1. Im Hauptmenü **Erstellen** wählen. Der geführte Modus öffnet sich.
2. Bei **Instanzverwaltungsschale** auf **Auswählen** klicken.

   ![Geführter Modus mit der Auswahl der Verwaltungsschalen-Art](/img/designer/gefuehrter-modus.png)

3. Das Asset in eigenen Worten beschreiben, z. B. „Demo-Dosierpumpe DP-50“,
   und **Weiter** wählen.
4. Die vorgeschlagenen Kennungen prüfen. Der Hinweis **Verfügbar** zeigt, dass
   die AAS-ID noch frei ist.

   ![Vorgeschlagene idShort, Asset-ID und AAS-ID mit dem Hinweis Verfügbar](/img/designer/assistent-kennungen.png)

5. Mit **Weiter** durch das digitale Typenschild und die
   Übergabedokumentation gehen und die bekannten Angaben eintragen. Leere
   optionale Felder sind erlaubt.
6. In der Zusammenfassung **Speichern** wählen. Die AAS wird in der aktuellen
   Infrastruktur angelegt und öffnet sich im [Editor](./designer/editor.md).

Alle Schritte des geführten Modus im Detail beschreibt
[AAS anlegen](./designer/aas-anlegen.md).

## Wie geht es weiter?

- Weitere Teilmodelle aus den [IDTA-Vorlagen](./designer/idta-vorlagen.md)
  einfügen und Werte im [Editor](./designer/editor.md) ergänzen.
- Die AAS [validieren](./designer/validierung.md) und das Ergebnis im
  [Viewer](./designer/viewer.md) ansehen.
- Die AAS über einen [geteilten Link](./designer/geteilte-links.md) oder als
  [AASX-Datei](./designer/import-export.md) weitergeben.
