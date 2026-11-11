---
sidebar_position: 15
title: Viewer
---

# Viewer

Der Viewer zeigt eine AAS mit ihren Teilmodellen lesend an. Er öffnet sich
über **Ansehen** in der [Liste der Verwaltungsschalen](./aas-verwalten.md)
oder im Editor über **Weitere Aktionen › Ansichtsmodus**.

![Viewer mit dem digitalen Typenschild](/img/designer/viewer-typenschild.png)

Links stehen die AAS-Details und die Liste der Teilmodelle, rechts der Inhalt
des gewählten Teilmodells. Oben rechts wechseln **Herunterladen** und
**Bearbeitungsmodus** zum Download bzw. in den [Editor](./editor.md).

## Ansichtsmodi

- **Formatierte Anzeige**: fachliche Darstellung. Für viele Teilmodelle der
  IDTA, z. B. Digital Nameplate, Technical Data, Carbon Footprint oder
  Handover Documentation, gibt es eigene Ansichten statt des reinen
  Elementbaums.
- **Unformatierte Anzeige**: alle Elemente als Baum.
- **JSON Ansicht**: das Teilmodell als JSON, wahlweise als Rohtext (Raw) oder
  als aufklappbare Objektansicht. Das Symbol rechts oben kopiert das JSON.

![Technische Daten in der formatierten Anzeige](/img/designer/viewer-technische-daten.png)

![JSON-Ansicht eines Teilmodells](/img/designer/viewer-json.png)

## Thematische Ansichten

Für die folgenden Teilmodelle zeigt die formatierte Anzeige eine eigene
Darstellung. Erkannt werden sie an der Semantic ID des Teilmodells; andere
Versionen derselben Vorlage erscheinen als Elementbaum.

| Teilmodell | Darstellung |
|---|---|
| Digital Nameplate 2.0 und 3.0 | Hersteller mit Logo, Seriennummer, Herstellungsdatum, Versionen, Kontaktdaten mit Karte des Standorts, Kennzeichen (z. B. CE) |
| Contact Informations (ZVEI 1.0) | Je Kontakt ein aufklappbarer Abschnitt mit Firma, Name, Anschrift, Telefon, E-Mail und Karte |
| Technical Data 1.1, 1.2 und 2.0 | Datenblatt mit Bildergalerie, allgemeinen Angaben und technischen Eigenschaften in Gruppen; gleichartige Gruppen, z. B. je Anschluss, als Tabelle |
| Carbon Footprint 1.0 | Je Lebenszyklusschritt ein grüner Kopf mit dem CO₂-Äquivalent, den Lebenszyklusphasen und den Berechnungsmethoden; Produktionsstandorte auf einer Karte |
| Carbon Footprint 0.9 | Ein Abschnitt je Footprint mit Berechnungsmethode, Wert und Lebenszyklusphase, Transport-Footprint und Karte |
| Handover Documentation | Dokumentkarten mit Vorschau, Öffnen und Herunterladen, siehe unten |
| Hierarchical Structures (Stückliste) | Hierarchiediagramm, das sich vergrößern, ausrichten und als SVG herunterladen lässt; Knoten führen zur verknüpften AAS |
| Time Series 1.1 | Diagramm der Messreihen mit Auswahl von Zeitraum, Datenpunkten und Diagrammart, optional automatisch aktualisiert |
| Asset Interfaces Description | Schnittstellen und Datenpunkte, siehe unten |
| Capability Description | Angebotene und benötigte Fähigkeiten mit Eigenschaften, Bedingungen und Beziehungen |
| Software Nameplate | Softwareprodukt, Versionen und Release-Informationen; zeigt, ob ein Update verfügbar ist |
| Article Information | Produktgruppe, Beschreibung, Gewicht und Auftragsnummer |
| DPP-Metadaten | Status des Produktpasses, Kennungen und Inhaltsspezifikationen, siehe [Digitaler Produktpass](./dpp.md) |
| Batteriepass | Eigene Ansichten für Typenschild, technische Daten, Zirkularität, Zustand und Materialzusammensetzung der Batterie |

Ist ein Teilmodell zwar angelegt, aber noch ohne Werte, z. B. direkt nach dem
Einfügen aus einer Vorlage, zeigt der Viewer den Hinweis „Dieses Teilmodell
enthält noch keine Werte“ statt der thematischen Ansicht.

Das Fragezeichen neben einer Beschriftung öffnet die Konzeptbeschreibung des
Merkmals, Einheiten stammen ebenfalls aus der Konzeptbeschreibung.

:::note Karten
Für die Karten in Typenschild, Kontaktdaten und Carbon Footprint schickt der
Browser die Adresse an OpenStreetMap, um den Ort zu finden, und lädt das
Kartenmaterial von dort. Ohne Internetzugang bleibt die Karte leer.
:::

## Verknüpfte AAS

Bei Entities zeigt der Viewer den Entity-Typ, die Globale Asset-ID bzw. die
spezifischen Asset-IDs sowie alle Statements an, auch ReferenceElements.

Ein Pfeil-Button führt direkt zur verknüpften AAS:

- bei einer `SelfManagedEntity` neben der Globalen Asset-ID; die AAS wird über
  ihre `assetInformation.globalAssetId` in der aktuellen Infrastruktur gesucht,
- bei einem ReferenceElement mit `ModelReference`, dessen erster Key vom Typ
  `AssetAdministrationShell` ist.

Wird keine passende AAS gefunden, erscheint ein Hinweis. In eingebetteten
Viewern ohne Navigationsmöglichkeit wird der Button nicht angezeigt.

## Asset Interfaces Description

Teilmodelle „Asset Interfaces Description“ (IDTA 02017) der Versionen 1.0 und
1.2 werden fachlich dargestellt:

- je Schnittstelle Titel, Protokoll, Authentifizierung und Basis-URL
  (kopierbar, bei HTTP direkt öffenbar),
- alle Datenpunkte (Properties, Actions, Events) als durchsuchbare
  Baumtabelle mit Datentyp, Einheit (gängige UN/ECE-Codes als Symbol, z. B.
  `Cel` als `°C`), Abruf (z. B. `GET /api/status`) und Live-Kennzeichen
  (observable),
- Forms und Security-Definitionen unter „Technische Details“.

Ist die Tabelle schmaler als 720 px (Smartphone, Viewer-Dialog), stehen
Datentyp, Einheit, Abruf und Live-Kennzeichen in einer Zeile unter dem Namen
des Datenpunkts.

## Dokumente der Handover Documentation

Der Viewer zeigt neben Bildern, PDF, XML, JSON und CSV auch HTML-Dokumente an.
HTML wird nur in einem abgeschotteten Frame (`sandbox`) ohne Skripte,
Formulare und Navigation dargestellt; „In neuem Tab öffnen“ wird für HTML
deshalb nicht angeboten. Ist kein Vorschaubild hinterlegt, nutzt die
Dokumentkarte die erste darstellbare Datei des Dokuments als Vorschau.

## Aufgeklappte Elemente

Der Viewer merkt sich, welche Collections, Listen und Dateien sowie welche
Abschnitte spezieller Ansichten (z. B. Dokumente der Handover Documentation,
PCF, Kontakte, Capabilities) auf- oder zugeklappt sind, je AAS, Teilmodell und
Pfad. Der Zustand bleibt beim Neuladen eines Teilmodells, beim Wechsel
zwischen Teilmodellen und beim Neuladen der Seite erhalten. Er gilt nur für
den aktuellen Browser-Tab.

## Bildschirmbreiten

Unter 1280 px Breite zeigt der Viewer statt der Seitenleiste einen kompakten
Kopf (Vorschaubild, idShort, Typ, Globale Asset-ID) und eine fixierte,
horizontal scrollbare Leiste zum Wechsel zwischen AAS-Details und
Teilmodellen.

Ab 1280 px steht derselbe kompakte Kopf über der Navigation in der
Seitenleiste. Die Seitenleiste bleibt beim Scrollen unter der Toolbar stehen;
eine lange Teilmodell-Liste scrollt darin separat. Ein Klick auf das
Vorschaubild zeigt es groß an.
