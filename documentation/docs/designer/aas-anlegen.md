---
sidebar_position: 5
title: AAS anlegen
---

# AAS anlegen

**Erstellen** im Hauptmenü öffnet den **geführten Modus**. Er fragt die
wichtigsten Angaben Schritt für Schritt ab und erzeugt daraus eine
vollständige AAS mit den passenden Teilmodellen.

![Geführter Modus: Typ auswählen](/img/designer/gefuehrter-modus.png)

| Auswahl | Wofür |
|---|---|
| Instanzverwaltungsschale | Ein konkretes Objekt mit eigenen Daten, z. B. Seriennummer |
| Typverwaltungsschale | Ein Produkttyp; enthält keine instanzspezifischen Daten, siehe [Typ und Instanz](./typ-und-instanz.md) |
| Ungeführt: Neue Verwaltungsschale | Leere AAS, die direkt im [Editor](./editor.md) bearbeitet wird |
| Spezialisierte Assistenten | Vorlagen für bestimmte Anwendungsfälle, siehe [Assistenten](./assistenten.md) |

## Beispiel: Instanzverwaltungsschale anlegen

Die Schritte oben im Assistenten zeigen, wo man sich befindet. Rechts steht
die Liste der Unterschritte des aktuellen Schritts; ein Klick darauf springt
direkt dorthin. **Weiter** und **Zurück** wechseln zwischen den Schritten.

### 1. Assetdaten erfassen

Zuerst wird das Asset in normalen Worten beschrieben, z. B. „Demo-Dosierpumpe
DP-50“. Die Beschreibung lässt sich in mehreren Sprachen angeben.

![Assistent: Asset beschreiben](/img/designer/assistent-basisdaten.png)

Daraus erzeugt der Designer eine lesbare **idShort** sowie Vorschläge für
**Asset-ID** und **AAS-ID** mit dem IRI-Präfix der eigenen Organisation. Die
Vorschläge lassen sich anpassen; der Hinweis **Verfügbar** zeigt, dass die
AAS-ID noch nicht vergeben ist.

![Assistent: erzeugte Kennungen prüfen](/img/designer/assistent-kennungen.png)

Optional kann anschließend ein Vorschaubild hochgeladen werden.

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
in der aktuellen Infrastruktur an und öffnet sie im [Editor](./editor.md), wo
sie weiter ergänzt werden kann.

![Assistent: Zusammenfassung](/img/designer/assistent-zusammenfassung.png)
