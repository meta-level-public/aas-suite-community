---
sidebar_position: 6
title: Typ und Instanz
---

# Typ und Instanz

Eine Typ-AAS beschreibt ein Produkt, wie es im Katalog steht. Eine
Instanz-AAS beschreibt ein einzelnes Exemplar davon (Hintergrund unter
[AAS-Grundlagen](./grundlagen.md#typ-und-instanz)). Ob eine AAS ein Typ oder
eine Instanz ist, zeigt die Spalte **Art des Asset** in der
[Liste der Verwaltungsschalen](./aas-verwalten.md) und das Kennzeichen neben
der AAS im Baum des [Editors](./editor.md).

## Typ-AAS anlegen

Im [geführten Modus](./aas-anlegen.md) **Typverwaltungsschale** wählen. Die
Schritte sind dieselben wie bei einer Instanz: Assetdaten, digitales
Typenschild, Übergabedokumentation und Zusammenfassung. Nur die Felder
**Seriennummer** und **Herstellungsjahr** fehlen im Typenschild, denn sie
gehören zu einem einzelnen Exemplar.

| | Typverwaltungsschale | Instanzverwaltungsschale |
|---|---|---|
| Art des Asset | Typ (`Type`) | Instanz (`Instance`) |
| Seriennummer, Herstellungsjahr | nicht enthalten | im Typenschild erfasst |
| Typische Inhalte | Katalogdaten, technische Daten, Dokumentation | Daten des Exemplars, z. B. Seriennummer und Betriebsdaten |

Die Art lässt sich auch nachträglich im Editor ändern: Abschnitt **Asset**,
Feld **Art des Asset**.

## Instanz aus einem Typ erstellen

Aus einer Typ-AAS entsteht mit wenigen Klicks eine Instanz, die alle Inhalte
des Typs übernimmt:

1. In der Liste der Verwaltungsschalen das Menü (⋮) der Typ-AAS öffnen.
2. **Erweitert › Instanz erstellen** wählen. Der Eintrag erscheint nur bei
   Typ-AAS und nur, wenn die Infrastruktur beschreibbar ist.

   ![Menü Erweitert mit dem Eintrag Instanz erstellen](/img/designer/shells-menue-erweitert.png)

3. Im Dialog die **Seriennummer** eintragen und das **Herstellungsdatum**
   prüfen (vorbelegt mit dem aktuellen Zeitpunkt). Ins Typenschild wird das
   Datum so übernommen, wie es im Dialog steht.

   ![Dialog Instanz erstellen](/img/designer/instanz-erstellen.png)

4. **Speichern**. Die neue Instanz öffnet sich im [Editor](./editor.md).

Dabei passiert Folgendes:

- Die AAS wird mit allen Teilmodellen, Dateien und dem Vorschaubild in
  dieselbe Infrastruktur kopiert. Die Typ-AAS bleibt unverändert.
- AAS, Teilmodelle und Asset erhalten neue Kennungen mit dem IRI-Präfix der
  eigenen Organisation.
- Die Instanz verweist auf die Typ-AAS, aus der sie erstellt wurde
  (`derivedFrom`), und die bisherige Asset-ID des Typs wird als
  **Asset-Typ** eingetragen. So bleibt erkennbar, von welchem Typ die
  Instanz stammt.
- In das digitale Typenschild (Digital Nameplate, Version 2.0 und 3.0)
  werden **Seriennummer**, **Herstellungsdatum** und das Jahr des
  Herstellungsdatums als **Baujahr** (`YearOfConstruction`) eingetragen.
  Fehlen diese Eigenschaften im Typenschild des Typs, werden sie ergänzt.

:::tip Viele Instanzen
Für jede weitere Instanz denselben Weg wiederholen. Instanzspezifische Werte,
z. B. Betriebsdaten oder Dokumente zum einzelnen Exemplar, werden danach im
Editor ergänzt.
:::

## Duplizieren

**Erweitert › Duplizieren** legt eine Kopie in derselben Infrastruktur an.
AAS und Teilmodelle erhalten neue Kennungen; Art des Asset und Asset-ID
bleiben dagegen unverändert. Die Kopie öffnet sich anschließend im Editor.
Soll die Kopie ein anderes Asset beschreiben, dort im Abschnitt **Asset** die
**Globale Asset-ID** anpassen.
