---
sidebar_position: 5
title: AAS anlegen
description: Wie im geführten Modus Schritt für Schritt eine neue AAS mit Kennungen, Typenschild und Dokumenten entsteht.
stichworte:
  Geführter Modus: ''
  Erstellen: geführten-modus-öffnen
  Assistenten verwenden: geführten-modus-öffnen
  Instanzverwaltungsschale: beispiel-instanzverwaltungsschale-anlegen
  Assetdaten: 1-assetdaten-erfassen
  AAS-ID: kennungen-und-id-status
  idShort: kennungen-und-id-status
  Bereits vorhanden: kennungen-und-id-status
  Vorschaubild: 1-assetdaten-erfassen
  Digitales Typenschild: 2-digitales-typenschild
quellen:
  - frontend/libs/designer-app-menu/src/lib/app-menu/app.menu.component.ts
  - frontend/libs/aas-designer-core/src/lib/shells-list/shells-list.component.ts
  - frontend/libs/aas-designer-core/src/lib/generator/generator.routes.ts
  - frontend/libs/aas-designer-core/src/lib/generator/generator-flow.config.ts
  - frontend/libs/aas-designer-core/src/lib/generator/generator-start/generator-start.component.html
  - frontend/libs/aas-designer-core/src/lib/generator/select-type/select-type.component.html
  - frontend/libs/aas-designer-core/src/lib/generator/select-type/select-type.component.ts
  - frontend/libs/aas-designer-core/src/lib/generator/asset-metadata/asset-metadata.component.html
  - frontend/libs/aas-designer-core/src/lib/generator/asset-metadata/asset-metadata.component.ts
  - frontend/libs/aas-designer-core/src/lib/generator/asset-metadata/asset-metadata.component.spec.ts
  - frontend/libs/aas-designer-core/src/lib/generator/asset-shell-id.utils.ts
  - frontend/libs/aas-designer-core/src/lib/generator/save-and-confirm/save-and-confirm.component.html
  - frontend/libs/aas-designer-core/src/lib/generator/save-and-confirm/save-and-confirm.component.ts
  - frontend/libs/translations/i18n/de.json
---

# AAS anlegen

Der **geführte Modus** fragt die wichtigsten Angaben Schritt für Schritt ab
und erzeugt daraus eine vollständige AAS mit den passenden Teilmodellen.

## Geführten Modus öffnen

Es gibt zwei Einstiege:

- **Erstellen** im Hauptmenü.
- **Hinzufügen › Assistenten verwenden** in der
  [Liste der Verwaltungsschalen](./aas-verwalten.md#neue-aas-hinzufügen).

:::note
Beide Einstiege gibt es nur, wenn die gewählte AAS-Infrastruktur
beschreibbar ist. Auf schreibgeschützten Infrastrukturen fehlen **Erstellen**
und **Hinzufügen**.
:::

Die erste Seite **Typ auswählen** bietet die möglichen Wege an; jeder wird
mit **Auswählen** gestartet.

![Geführter Modus: Typ auswählen](/img/designer/gefuehrter-modus.png)

| Auswahl | Wofür |
|---|---|
| Instanzverwaltungsschale | Ein konkretes Objekt mit eigenen Daten, z. B. Seriennummer |
| Typverwaltungsschale | Ein Produkttyp; enthält keine instanzspezifischen Daten, siehe [Typ und Instanz](./typ-und-instanz.md) |
| Ungeführt: Neue Verwaltungsschale | Legt sofort eine leere AAS an und öffnet sie im [Editor](./editor.md) |
| Spezialisierte Assistenten | Vorlagen für bestimmte Anwendungsfälle, siehe [Assistenten](./assistenten.md) |

## Beispiel: Instanzverwaltungsschale anlegen

Die Schritte oben im Assistenten zeigen, wo man sich befindet. Rechts steht
die Liste der Unterschritte des aktuellen Schritts; ein Klick darauf springt
direkt dorthin. **Weiter** und **Zurück** wechseln zwischen den Schritten.
**Weiter** ist gesperrt, solange im aktuellen Unterschritt eine Pflichtangabe
fehlt; ein Hinweis darunter nennt den Grund.

### 1. Assetdaten erfassen

Der Schritt **Basisdaten** hat drei Unterschritte.

1. **Beschreibe zuerst dein Asset**: Das Asset in normalen Worten
   beschreiben, z. B. „Demo-Dosierpumpe DP-50“. Die Beschreibung lässt sich
   in mehreren Sprachen angeben. Mindestens eine Sprache braucht einen Text
   mit wenigstens zwei Zeichen, sonst bleibt **Weiter** gesperrt.

   ![Assistent: Asset beschreiben](/img/designer/assistent-basisdaten.png)

2. **Prüfe die erzeugten Kennungen**: Aus der Beschreibung erzeugt der
   Designer eine lesbare **idShort** und daraus **AssetID** und **AAS ID**
   mit dem IRI-Präfix der eigenen Organisation. Wie die Kennungen entstehen
   und was der Status neben der AAS ID bedeutet, steht unter
   [Kennungen und ID-Status](#kennungen-und-id-status).

   ![Assistent: erzeugte Kennungen prüfen](/img/designer/assistent-kennungen.png)

3. **Füge ein Bild hinzu**: Optional ein Vorschaubild über
   **Datei auswählen** oder per Drag & Drop hochladen.

### 2. Digitales Typenschild

Das Teilmodell **Digital Nameplate** der IDTA nimmt Hersteller, Adresse,
Produktbezeichnung, Seriennummer, Herstellungsjahr und weitere Angaben auf.
Jede Gruppe ist ein eigener Unterschritt.

![Assistent: Digitales Typenschild](/img/designer/assistent-typenschild.png)

:::tip Stammdaten wiederverwenden
Über die Auswahlliste oberhalb der Adressfelder lässt sich eine Adresse
aus dem [Adresskatalog](./mein-bereich.md#adressen) übernehmen. Ebenso
bieten Produktstamm, Produktfamilie und Produktbezeichnung eine Auswahl aus
den [Produktkatalogen](./mein-bereich.md#produktstämme-produktfamilien-und-produktbezeichnungen).
:::

### 3. Übergabedokumentation

Hier werden Dokumente für das Teilmodell **Handover Documentation**
angelegt, z. B. Betriebsanleitungen oder Konformitätserklärungen.

![Assistent: Übergabedokumentation](/img/designer/assistent-dokumente.png)

### 4. Zusammenfassung und Speichern

Die Zusammenfassung zeigt alle erfassten Angaben. **Speichern** legt die AAS
in der aktuellen Infrastruktur an, meldet „Verwaltungsschale wurde
gespeichert“ und öffnet sie im [Editor](./editor.md), wo sie weiter ergänzt
werden kann. **Zurück** führt zum vorigen Schritt, ohne Angaben zu
verlieren.

![Assistent: Zusammenfassung](/img/designer/assistent-zusammenfassung.png)

## Kennungen und ID-Status

Im Unterschritt **Prüfe die erzeugten Kennungen** gilt:

- Die **idShort** wird aus den ersten Wörtern der Beschreibung
  vorgeschlagen, aus „Demo-Dosierpumpe DP-50“ z. B. `demoDosierpumpeDp50`.
  Sie lässt sich überschreiben. Umlaute werden dabei umgeschrieben (z. B.
  „ü“ zu „ue“), Leerzeichen und Sonderzeichen werden zu `_`.
- **AssetID** und **AAS ID** sind nicht direkt änderbar. Sie entstehen aus
  dem IRI-Präfix der Organisation und der idShort, z. B.
  `…/ids/asset/demoDosierpumpeDp50` und `…/ids/aas/demoDosierpumpeDp50`.
  Wer sie ändern will, ändert die idShort.
- Weicht die idShort vom Vorschlag ab, steht darunter
  „Vorgeschlagene Kennung: …“ mit **Vorschlag übernehmen**. Damit kehrt man
  zum Vorschlag aus der Beschreibung zurück.

Neben der **AAS ID** zeigt ein Status, ob die Kennung im Ziel-Repository
noch frei ist:

| Status | Bedeutung |
|---|---|
| Prüfung läuft | Der Designer fragt das Repository ab; **Weiter** ist so lange gesperrt |
| Verfügbar | Die AAS ID ist noch nicht vergeben |
| Bereits vorhanden | Es gibt schon eine AAS mit dieser Kennung; **Weiter** ist gesperrt |

Bei einem automatisch erzeugten Vorschlag weicht der Designer selbst auf eine
freie Kennung aus, indem er eine Nummer anhängt oder hochzählt, z. B.
`demoDosierpumpeDp51`. Bei einer selbst eingetragenen idShort meldet er
stattdessen „Diese AAS-ID existiert im Ziel-Repository bereits: …“ und
schlägt unter „Freie Alternative: …“ eine freie Kennung vor:

1. **Korrigieren** übernimmt die freie Alternative als idShort.
2. Alternativ eine andere idShort eintragen. Der Status wird neu geprüft.
3. Sobald der Status **Verfügbar** zeigt, geht es mit **Weiter** weiter.
