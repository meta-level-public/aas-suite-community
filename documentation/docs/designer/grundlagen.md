---
sidebar_position: 2
title: AAS-Grundlagen
---

# AAS-Grundlagen

Diese Seite erklärt die Begriffe, die im Designer immer wieder vorkommen. Wer
schon mit Verwaltungsschalen arbeitet, kann sie überspringen. Kurze
Erklärungen stehen außerdem im [Glossar](./glossar.md).

## Asset und Verwaltungsschale

Ein **Asset** ist ein Gegenstand, über den Informationen bereitgestellt
werden, z. B. eine Pumpe, ein Sensor oder eine Maschine. Auch Software oder
ein Dokument kann ein Asset sein.

Die **Verwaltungsschale** (Asset Administration Shell, **AAS**) ist der
digitale Zwilling dieses Assets. Sie bündelt alle Informationen über das
Asset in einer standardisierten, maschinenlesbaren Form. Der Standard wird von
der Industrial Digital Twin Association (IDTA) gepflegt und ist als
IEC 63278 genormt.

Jede AAS hat zwei weltweit eindeutige Kennungen:

| Kennung | Bedeutung | Beispiel |
|---|---|---|
| AAS-ID | Kennung der Verwaltungsschale selbst | `https://example.com/ids/aas/demoKreiselpumpeKp200` |
| Globale Asset-ID | Kennung des Assets, das beschrieben wird | `https://example.com/ids/asset/demoKreiselpumpeKp200` |

Dazu kommt der **idShort**, ein kurzer, lesbarer Name ohne Leerzeichen, z. B.
`demoKreiselpumpeKp200`. Er muss nur innerhalb seiner Ebene eindeutig sein.

:::tip Kennungen dauerhaft wählen
AAS-ID und Asset-ID sollten sich nach dem Veröffentlichen nicht mehr ändern,
denn andere Systeme verweisen darauf. Der Designer schlägt Kennungen mit dem
IRI-Präfix der eigenen Organisation vor.
:::

## Typ und Instanz

Eine AAS beschreibt entweder einen **Typ** oder eine **Instanz**:

- Eine **Typ-AAS** beschreibt ein Produkt, wie es im Katalog steht, z. B. die
  Kreiselpumpe KP-200 mit ihren technischen Daten. Sie enthält keine Angaben
  zu einem einzelnen Exemplar.
- Eine **Instanz-AAS** beschreibt ein konkretes Exemplar, z. B. die Pumpe mit
  der Seriennummer 4711, hergestellt im März 2026, mit ihren Betriebsdaten.

Aus einer Typ-AAS lassen sich Instanzen ableiten, siehe
[Typ und Instanz](./typ-und-instanz.md).

## Teilmodelle

Die Informationen einer AAS sind in **Teilmodelle** (Submodels) gegliedert.
Jedes Teilmodell behandelt ein Thema, z. B.:

| Teilmodell | Inhalt |
|---|---|
| Digital Nameplate | Das digitale Typenschild: Hersteller, Produktbezeichnung, Seriennummer, Kennzeichnungen |
| Technical Data | Technische Daten, z. B. Leistung, Abmessungen, Gewicht |
| Handover Documentation | Dokumente wie Betriebsanleitungen und Konformitätserklärungen |
| Carbon Footprint | CO2-Fußabdruck des Produkts |
| Contact Information | Ansprechpartner und Adressen |

Für viele Themen gibt es von der IDTA standardisierte Vorlagen, siehe
[IDTA-Vorlagen](./idta-vorlagen.md). Ein Teilmodell ist ein eigenständiges
Objekt mit eigener ID. Die AAS enthält nur Verweise darauf; deshalb kann ein
Teilmodell auch mehreren AAS zugeordnet sein.

## Elemente

Teilmodelle bestehen aus **Elementen** (Submodel Elements). Im Baum des
[Editors](./editor.md) steht vor jedem Element ein Kürzel für seinen Typ:

| Kürzel | Elementtyp | Wofür |
|---|---|---|
| SMC | Submodel Element Collection | Gruppe zusammengehöriger Elemente, z. B. eine Adresse |
| SML | Submodel Element List | Liste gleichartiger Elemente, z. B. mehrere Kennzeichnungen |
| Prop | Property | Ein einzelner Wert mit Datentyp, z. B. eine Zahl oder ein Datum |
| MLP | Multi Language Property | Ein Text in mehreren Sprachen, z. B. eine Produktbezeichnung |
| Range | Range | Ein Wertebereich mit Minimum und Maximum |
| File | File | Eine Datei, z. B. ein Bild oder ein PDF |
| Blob | Blob | Binärdaten direkt im Modell |
| Ref | Reference Element | Verweis auf ein anderes Element oder eine andere AAS |
| Rel | Relationship Element | Beziehung zwischen zwei Elementen (auch mit Anmerkungen) |
| Ent | Entity | Ein Teil oder Bestandteil, ggf. mit eigener AAS (z. B. in einer Stückliste) |
| Opr | Operation | Eine aufrufbare Funktion |
| Cap | Capability | Eine Fähigkeit des Assets |
| Evt | Basic Event Element | Ein Ereignis |

## Semantik

Damit eine Maschine versteht, was ein Wert bedeutet, trägt jedes Element eine
**Semantic ID**. Sie verweist auf eine eindeutige Definition, z. B. in ECLASS,
IEC CDD oder in einer Vorlage der IDTA. Zwei Elemente mit derselben Semantic
ID bedeuten dasselbe, egal wie sie heißen.

Die Definition selbst steht in einer **Konzeptbeschreibung** (Concept
Description, CD): Name in mehreren Sprachen, Definition, Einheit und Datentyp.
Konzeptbeschreibungen werden im Designer eigens verwaltet, siehe
[Konzeptbeschreibungen](./konzeptbeschreibungen.md).

## AAS-Infrastruktur

Gespeichert werden AAS nicht im Designer selbst, sondern in einer
**AAS-Infrastruktur**. Sie besteht aus mehreren Diensten nach der
AAS-Spezifikation (Teil 2, API):

| Dienst | Aufgabe |
|---|---|
| AAS Repository | Speichert die Verwaltungsschalen |
| Submodel Repository | Speichert die Teilmodelle |
| Concept Description Repository | Speichert die Konzeptbeschreibungen |
| AAS Registry und Submodel Registry | Verzeichnisse, unter welcher Adresse eine AAS bzw. ein Teilmodell erreichbar ist |
| Discovery | Findet zu einer Asset-ID die passende AAS |

Eine Organisation kann mehrere Infrastrukturen nutzen. Welche gerade aktiv
ist, steht oben in den Listen und im Editor.

## Austauschformate

AAS lassen sich als Datei weitergeben:

- **AASX** ist ein Paket (ZIP-Format) mit AAS, Teilmodellen,
  Konzeptbeschreibungen und angehängten Dateien wie Bildern und PDFs.
- **JSON** enthält das Modell als Text, aber keine angehängten Dateien.

Wie das im Designer funktioniert, steht unter
[Import und Export](./import-export.md).
