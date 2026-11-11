---
sidebar_position: 8
title: Editor
---

# Editor

Im Editor werden AAS, Teilmodelle und ihre Elemente bearbeitet. Er öffnet
sich nach dem Anlegen einer AAS oder über **Bearbeiten** in der
[Liste der Verwaltungsschalen](./aas-verwalten.md).

![Editor mit geöffneter AAS](/img/designer/editor-uebersicht.png)

## Aufbau

- **Links** steht der Baum mit der AAS, ihren Teilmodellen (SM), Collections
  (SMC), Listen (SML) und Eigenschaften (Prop, MLP, File). Das Suchfeld über
  dem Baum filtert die Einträge.
- **Rechts** stehen die Angaben des im Baum gewählten Eintrags, gegliedert in
  aufklappbare Abschnitte wie Details, Inhalt und Semantische Beschreibung.
- **Oben rechts** steht die Werkzeugleiste:

| Symbol | Funktion |
|---|---|
| Haken | Validieren: prüft die AAS, siehe [Validierung](./validierung.md) |
| Diskette | Speichern |
| i | Information zur AAS |
| Papierkorb | Gewählten Eintrag löschen |
| × | Reset: verwirft alle ungespeicherten Änderungen |
| Pfeile | Rückgängig und Wiederherstellen |
| Schrittpfeile | Zum zuletzt bzw. nächsten markierten Eintrag springen |
| ⋮ | Weitere Aktionen, z. B. [Export](./import-export.md) und Wechsel in den Ansichtsmodus |

![Weitere Aktionen im Editor](/img/designer/editor-weitere-aktionen.png)

Jede gespeicherte Änderung wird im Teilmodell **AasDesignerChangelog**
protokolliert.

## Teilmodell einfügen

Jeder Eintrag im Baum hat ein Menü (⋮). An der AAS führt
**Hinzufügen** zu den Teilmodellen:

![Menü Hinzufügen an der AAS](/img/designer/editor-menue-hinzufuegen.png)

| Eintrag | Bedeutung |
|---|---|
| Teilmodelle | Neues Teilmodell aus einer Vorlage |
| Referenz auf Teilmodell | Verweis auf ein vorhandenes Teilmodell |
| Schnipsel | Gespeicherte Bausteine wiederverwenden, siehe [Schnipsel](./schnipsel.md) |
| Aus Erweiterung | Teilmodelle aus installierten Erweiterungen |
| Teilmodell aus JSON | Teilmodell aus einer JSON-Datei, siehe unten |

**Teilmodelle** öffnet den Dialog **Teilmodell einfügen**:

![Dialog Teilmodell einfügen](/img/designer/teilmodell-einfuegen.png)

- **Sonstiges**: leeres Teilmodell
- **Integrierte Vorlagen**: Vorlagen, die mit dem Designer ausgeliefert werden
- **IDTA (live aus dem Repository)**: die aktuellen Vorlagen der IDTA, siehe
  [IDTA-Vorlagen](./idta-vorlagen.md)

Das Suchfeld filtert die Vorlagen; **Übernehmen** fügt die gewählte Vorlage
ein. Im Beispiel wird **TechnicalData** in Version 2.0 übernommen:

![IDTA-Vorlagen im Dialog Teilmodell einfügen](/img/designer/teilmodell-einfuegen-idta.png)

Das neue Teilmodell erscheint sofort im Baum. Gespeichert wird es erst mit
**Speichern** in der Werkzeugleiste.

## Teilmodell ansehen oder bearbeiten

Ein Klick auf ein Teilmodell im Baum zeigt es zunächst in der **Ansicht**,
so wie im [Viewer](./viewer.md). Für viele IDTA-Teilmodelle gibt es dabei eine
fachliche Darstellung, hier die technischen Daten:

![Teilmodell in der Ansicht im Editor](/img/designer/editor-teilmodell-ansicht.png)

**Bearbeiten** oben rechts zeigt stattdessen die Angaben des Teilmodells zum
Bearbeiten (ID, idShort, Semantic ID usw.), **Ansicht** wechselt zurück.
Einzelne Elemente werden immer über den Baum bearbeitet.

## Werte bearbeiten

Ein Klick auf eine Eigenschaft im Baum zeigt rechts ihre Angaben. Der Wert
steht im Abschnitt **Inhalt**. Im Beispiel wird unter
TechnicalData › GeneralInformation der Herstellername eingetragen:

![Wert einer Eigenschaft bearbeiten](/img/designer/editor-wert-bearbeiten.png)

- **Details**: idShort, Beschreibung, Anzeigename (mehrsprachig), Datentyp
  und Kategorie.
- **Inhalt**: der Wert. Bei mehrsprachigen Eigenschaften (MLP) gibt es eine
  Zeile pro Sprache, bei Dateien (File) einen Upload.
- **Semantische Beschreibung**: die Semantic ID und, falls im
  CD-Repository vorhanden, die Definition des Elements. Fehlt die
  Beschreibung, lässt sie sich hier anlegen oder im Repository suchen.

Die Änderung ist sofort im Baum sichtbar; **Speichern** schreibt sie in die
Infrastruktur.

## Elemente hinzufügen

Das Menü an einer Collection oder einem Teilmodell bietet unter
**Hinzufügen** weitere Elemente an:

![Menü Hinzufügen an einer Collection](/img/designer/editor-menue-element.png)

- **Elemente**: neue Elemente beliebigen Typs
- **Optionale Elemente**: Elemente, die die Vorlage vorsieht, aber noch nicht
  enthalten sind
- **Fehlende Elemente**: Pflichtelemente der Vorlage, die noch fehlen
- **Schnipsel**, **Aus Erweiterung**, **Element aus JSON**

Weitere Einträge im Menü sind **Umwandeln** (z. B. eine Property in eine
mehrsprachige Property), **Kopieren**, **Löschen** und **Speichern als …**
(als JSON oder als [Schnipsel](./schnipsel.md)).

## Teilmodelle aus JSON importieren

Der JSON-Import im Teilmodell-Dialog akzeptiert ein einzelnes Objekt mit
`modelType: Submodel`. Ein AAS-Environment-Wrapper oder Concept Descriptions
sind dafür nicht erforderlich. Die Vorprüfung verwendet denselben Parser wie
der eigentliche Import; andere Modelltypen werden dort abgewiesen.

## Verweise auf andere AAS im System

Über den Dialog **AAS auswählen** lässt sich eine AAS aus der aktuellen
AAS-Infrastruktur übernehmen:

- **Entity, Feld Globale Asset-ID**: übernimmt
  `assetInformation.globalAssetId` der gewählten AAS. Das ist der
  spezifikationskonforme Weg, um eine `SelfManagedEntity` mit der AAS ihres
  Assets zu verknüpfen.
- **Referenz vom Typ `ModelReference`**: setzt genau einen Key
  `AssetAdministrationShell` mit der ID der gewählten AAS.
- **Referenz vom Typ `ExternalReference`**: bei Keys vom Typ
  `GlobalReference` wird die ID der gewählten AAS als Wert eingetragen.

Wie solche Verweise im Viewer angezeigt werden, steht unter
[Viewer](./viewer.md#verknüpfte-aas).

## Teilmodell einzeln bearbeiten

Ein Teilmodell lässt sich auch ohne seine AAS bearbeiten: ein Klick auf
eine Zeile in der Liste **Teilmodelle** öffnet den Teilmodell-Editor. Er
sieht aus wie der Editor, der Baum enthält aber nur das Teilmodell.

![Teilmodell-Editor](/img/designer/teilmodell-bearbeiten.png)

- **Validieren** prüft nur das Teilmodell und seine Konzeptbeschreibungen.
- **Speichern** speichert zuerst die zugehörigen Konzeptbeschreibungen und
  dann das Teilmodell.
- **i** öffnet die **Teilmodell-Information** mit ID, idShort, der Anzahl der
  Dateien, Konzeptbeschreibungen und AAS-Referenzen sowie den AAS, die das
  Teilmodell verwenden.

Das ist praktisch für Teilmodelle, die mehreren AAS zugeordnet sind: Eine
Änderung wirkt sich auf alle diese AAS aus.

## Digitaler Produktpass

Ist für die Infrastruktur ein DPP-Dienst eingerichtet, zeigt der Editor bei
der AAS die Leiste **DPP** mit dem Button **DPP-Metadaten anlegen**. Wie ein
Pass angelegt und veröffentlicht wird, steht unter
[Digitaler Produktpass](./dpp.md).
