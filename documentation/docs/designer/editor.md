---
sidebar_position: 8
title: Editor
description: Aufbau des Editors, Speichern mit Änderungsprotokoll, Arbeiten im Baum sowie Einfügen, Kopieren, Verschieben und Löschen von Teilmodellen und Elementen.
stichworte:
  Editor: ''
  Werkzeugleiste: werkzeugleiste
  Speichern: speichern-und-änderungsprotokoll
  Änderungsprotokoll: speichern-und-änderungsprotokoll
  Konfliktwarnung: änderungen-anderer-benutzer
  Teilmodell einfügen: teilmodell-einfügen
  Kopieren und Einfügen: kopieren-und-einfügen
  Drag & Drop: elemente-verschieben
  Teilmodell-Editor: teilmodell-einzeln-bearbeiten
  Template Qualifier: teilmodell-einfügen
quellen:
  - frontend/libs/aas-designer-core/src/lib/v3-editor/editor-start/editor-start.component.html
  - frontend/libs/aas-designer-core/src/lib/submodel-editor/submodel-editor.routes.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/v3-editor.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/v3-editor.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/v3-editor-validation.service.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/v3-editor-capability.service.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/changelog-appender.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/enter-changelog-comment/enter-changelog-comment.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor.routes.ts
  - frontend/libs/aas-designer-core/src/lib/guards/deactivate.guard.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree/v3-tree.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree/v3-tree.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree/v3-tree-labels.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree/v3-tree-drag-drop.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree/v3-tree-json-import.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/v3-context-menu-model.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/v3-context-menu-permissions.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/v3-tree-context-menu.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/v3-tree-content-mutations.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/v3-insert-options.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/v3-addon-editor.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/addon-resolver.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/dialogs/insert-submodel/v3-insert-submodel-dialog.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/dialogs/paste-question/v3-paste-question-dialog.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/v3-tree-content-mutations.spec.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/v3-property-editor/v3-property-editor.component.html
  - frontend/libs/aas-designer-core/src/lib/general/extended-search/extended-search.component.ts
  - frontend/libs/aas-designer-core/src/lib/submodel-editor/submodel-editor.component.html
  - frontend/libs/aas-designer-core/src/lib/submodel-editor/submodel-editor.component.ts
  - frontend/libs/translations/i18n/de.json
---

# Editor

Im Editor werden AAS, Teilmodelle und ihre Elemente bearbeitet. Er öffnet
sich nach dem Anlegen einer AAS oder über **Bearbeiten** in der
[Liste der Verwaltungsschalen](./aas-verwalten.md).

![Editor mit geöffneter AAS](/img/designer/editor-uebersicht.png)

## Aufbau

- **Links** steht der Baum mit der AAS, ihren Teilmodellen (SM), Collections
  (SMC), Listen (SML) und Eigenschaften (Prop, MLP, File). Darunter folgen die
  Knoten **ConceptDescriptions** mit den Konzeptbeschreibungen und
  **SupplementalFiles** mit den Zusatzdateien der AAS. Das Suchfeld über
  dem Baum filtert die Einträge.
- **Rechts** stehen die Angaben des im Baum gewählten Eintrags, gegliedert in
  aufklappbare Abschnitte wie Details, Inhalt und Semantische Beschreibung.
- **Oben links** zeigt **AAS Infrastruktur**, in welcher Infrastruktur die AAS
  liegt.
- **Oben rechts** steht die Werkzeugleiste.

### Baum

Über dem Baum stehen **Erweiterte Suche** (Lupe mit Plus), die idShort der
AAS sowie **Aufklappen** und **Zuklappen** für alle Einträge. Die erweiterte
Suche durchsucht wahlweise idShort, Werte, Konzeptbeschreibungen, Semantic IDs
oder **Überall** und springt mit **Vorheriges** und **Nächstes** zwischen den
Treffern.

Vor jedem Eintrag steht ein Kürzel für seinen Typ, siehe
[AAS-Grundlagen](./grundlagen.md#elemente). Neben der AAS zeigt ein zweites
Kennzeichen die Art des Asset, z. B. **Typ** oder **Instanz**. Teilmodelle,
die selbst Vorlagen sind, beginnen mit `<T>`. Verweist die AAS auf ein
Teilmodell, das in der Infrastruktur fehlt, steht dort **Fehlendes
Teilmodell**.

Mit den Pfeiltasten lässt sich im Baum navigieren: hoch und runter zum
vorigen bzw. nächsten Eintrag, rechts und links zum Auf- und Zuklappen.

### Werkzeugleiste

| Symbol | Funktion |
|---|---|
| Haken | **Validieren**: prüft die AAS, siehe [Validierung](./validierung.md). Der Pfeil daneben bietet außerdem **IDs validieren** und **Änderungen anzeigen (für Profis ;-)** an. |
| Warndreieck mit Zahl | Erscheint nach einer Validierung mit Fehlern; ein Klick öffnet das Ergebnis |
| Diskette | Speichern, siehe [unten](#speichern-und-änderungsprotokoll) |
| Papierkorb | Löscht die **ganze AAS** aus der Infrastruktur |
| × | **Reset**: verwirft alle ungespeicherten Änderungen |
| Pfeile | **Rückgängig** und **Wiederherstellen** |
| Schrittpfeile | Zum zuletzt bzw. nächsten markierten Eintrag springen |
| ⋮ | **Weitere Aktionen**: **Export \*.aasx** (siehe [Import und Export](./import-export.md)) und **Ansichtsmodus** |

![Weitere Aktionen im Editor](/img/designer/editor-weitere-aktionen.png)

Der Papierkorb und **Export \*.aasx** sind nur ohne ungespeicherte Änderungen
verfügbar. Vor dem Löschen fragt der Designer „Soll die AAS wirklich gelöscht
werden?“; danach öffnet sich die Liste der Verwaltungsschalen. Einzelne
Einträge im Baum werden über ihr Menü gelöscht, siehe
[Löschen](#löschen).

### Speichern und Änderungsprotokoll

Ein Klick auf die Diskette speichert alle Änderungen in der Infrastruktur.
Ohne Änderungen ist der Button gesperrt. Der Pfeil daneben bietet drei
Varianten:

| Eintrag | Wirkung |
|---|---|
| **Speichern** | Speichert und ergänzt das Änderungsprotokoll |
| **Mit Kommentar speichern** | Öffnet den Dialog **Änderungskommentar**. Der **Kommentar** wird mit dem Protokolleintrag gespeichert; **Speichern** ist erst mit einem Kommentar möglich. |
| **Speichern ohne Changelog** | Speichert, ohne einen Protokolleintrag anzulegen |

![Geöffnetes Speichern-Menü im Editor mit Speichern, Mit Kommentar speichern und Speichern ohne Changelog](/img/designer/editor-speichern-menue.png)

Das Änderungsprotokoll steht im Teilmodell **AasDesignerChangelog** der AAS.
Fehlt es, legt der Designer es beim ersten Speichern an. Jeder Eintrag enthält
Zeitpunkt, Benutzer und gegebenenfalls den Kommentar.

Wer den Editor mit ungespeicherten Änderungen verlässt, wird gefragt: „Möchten
Sie ohne zu speichern fortfahren?“

### Änderungen anderer Benutzer

Ändert jemand anderes die geöffnete AAS oder eines ihrer Teilmodelle in
derselben Infrastruktur, erscheint oben links eine Warnung: Beim Speichern
würden die anderen Änderungen überschrieben.

- **Änderungen anzeigen** vergleicht den Stand im Editor mit dem
  gespeicherten Stand.
- **Meine Änderungen verwerfen** verwirft die eigenen Änderungen und lädt die AAS neu.

:::warning
Wer trotz der Warnung speichert, überschreibt die Änderungen der anderen
Person. Im Zweifel zuerst **Änderungen anzeigen** und sich abstimmen.
:::

## Teilmodell einfügen

Jeder Eintrag im Baum hat ein Menü (⋮). An der AAS führt
**Hinzufügen** zu den Teilmodellen:

![Menü Hinzufügen an der AAS](/img/designer/editor-menue-hinzufuegen.png)

| Eintrag | Bedeutung |
|---|---|
| Teilmodelle | Neues Teilmodell aus einer Vorlage |
| Referenz auf Teilmodell | Verweis auf ein vorhandenes Teilmodell, gewählt im Dialog **Submodel auswählen** |
| Schnipsel | Gespeicherte Bausteine wiederverwenden, siehe [Schnipsel](./schnipsel.md) |
| Aus Erweiterung | Assistenten für bestimmte Inhalte, siehe [Assistenten im Editor](#assistenten-im-editor); ohne passenden Inhalt steht dort **Keine Elemente verfügbar** |
| Teilmodell aus JSON | Teilmodell aus einer JSON-Datei, siehe unten |

**Teilmodelle** öffnet den Dialog **Teilmodell einfügen**:

![Dialog Teilmodell einfügen](/img/designer/teilmodell-einfuegen.png)

Die Vorlagen sind in Gruppen gegliedert, die sich einzeln aufklappen lassen:

- **Sonstiges**: **Eigenes** legt ein leeres Teilmodell an.
- **Integrierte Vorlagen**: Vorlagen, die mit dem Designer ausgeliefert werden
- **VDMA**: erscheint nur, wenn solche Vorlagen vorhanden sind
- **IDTA (live aus dem Repository)**: die aktuellen Vorlagen der IDTA, siehe
  [IDTA-Vorlagen](./idta-vorlagen.md)

Hat eine Gruppe mehr als drei Einträge, filtert ein Suchfeld die Vorlagen;
**Übernehmen** fügt die gewählte Vorlage ein. Im Beispiel wird
**TechnicalData** in Version 2.0 übernommen:

![IDTA-Vorlagen im Dialog Teilmodell einfügen](/img/designer/teilmodell-einfuegen-idta.png)

Das neue Teilmodell erscheint sofort im Baum. Gespeichert wird es erst mit
**Speichern** in der Werkzeugleiste.

Manche Vorlagen enthalten Beispieldaten als Werte, etwa „Muster AG“ im
Typenschild. Damit sie nicht wie echte Angaben aussehen, sind die Felder nach
dem Einfügen leer; das Beispiel steht weiterhin als Beispielwert (Qualifier
`ExampleValue`) am Element und dient als Hinweis auf das erwartete Format.

Vorlagen beschreiben mit Qualifiern außerdem, wie das Teilmodell aufgebaut sein
darf, z. B. `SMT/Cardinality` für die Anzahl eines Elements. In einer AAS für
ein konkretes Produkt werden sie nicht gebraucht: Im Baum entfernt
**Template Qualifier entfernen** im Menü ⋮ des Teilmodells sie aus dem
Teilmodell und allen enthaltenen Elementen. Erkannt werden sie am Typ (`SMT/…`,
`Cardinality`, `Multiplicity`) oder an ihrer Semantic ID
(`https://admin-shell.io/SubmodelTemplates/…`), bei älteren AAS auch an der Art
(`kind`) „TemplateQualifier“. Die Art ist im AAS-Metamodell inzwischen für
ungültig erklärt („invalidated“) und fehlt in neueren Vorlagen. Beispielwerte
(`ExampleValue`) und eigene Qualifier bleiben erhalten.

Beim Bearbeiten eines Elements zeigt der Bereich **Qualifizierer** die Art
(`kind`) deshalb nur noch an, wenn ein Qualifier aus einer älteren AAS sie
schon hat; ändern lässt sie sich nicht mehr. Neue Qualifier bekommen keine
Art, auch nicht die vorgefertigten Einträge unter **AASPE Qualifiers** oder
die Rolle (angeboten oder benötigt) einer Capability.

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
- Weitere Abschnitte: **Qualifizierer**, **Datenbeschreibung** und
  **Endpunkt-URL**.

Welche Abschnitte auf- oder zugeklappt sind, merkt sich der Editor im
Browser.

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

An einer Liste (SML) fügt **Kindelement einfügen** ein weiteres Element ein.
Hat die Liste schon Einträge, wird der erste kopiert; der Designer fragt, ob
dessen Werte übernommen oder geleert werden sollen.

Weitere Einträge im Menü sind **Umwandeln** (Property in mehrsprachige
Property und umgekehrt, Collection in Liste und umgekehrt), **Kopieren**,
**Einfügen**, **Löschen** und **Speichern als...** mit **Als Schnipsel
speichern** und **Als JSON speichern** (siehe [Schnipsel](./schnipsel.md)).

## Kopieren und einfügen

1. Im Menü (⋮) des Eintrags **Kopieren** wählen.
2. Im Menü des Ziels **Einfügen** wählen. Der Eintrag erscheint nur, wenn das
   Ziel die Kopie aufnehmen kann.

| Kopiert | Einfügen an |
|---|---|
| Element (z. B. Property, Collection, Liste, Entity, Datei) | Teilmodell, Collection, Liste oder Entity |
| Teilmodell | AAS |
| Konzeptbeschreibung | ConceptDescriptions |

Die Kopie erhält die idShort mit vorangestelltem `copy_of_`, z. B.
`copy_of_ManufacturerName`.

Beim Einfügen eines Teilmodells in eine AAS fragt der Designer im Dialog
**Einfügen**, wie es eingefügt wird:

| Button | Wirkung |
|---|---|
| **Als Referenz einfügen** | Die AAS erhält nur eine Referenz auf das bestehende Teilmodell. Es bleibt dasselbe Teilmodell mit derselben ID; Änderungen daran wirken in allen AAS, die es referenzieren. |
| **Als echte Kopie einfügen** | Das Teilmodell wird kopiert und erhält eine neue ID; die Kopie ist unabhängig vom Original. |

Die Frage erscheint nur, wenn das kopierte Teilmodell in derselben Umgebung
noch vorhanden ist und die Ziel-AAS es noch nicht referenziert. Sonst fügt der
Designer ohne Rückfrage eine Kopie mit neuer ID ein. Einen Verweis auf ein
beliebiges vorhandenes Teilmodell setzt außerdem **Hinzufügen › Referenz auf
Teilmodell**.

## Elemente verschieben

Elemente lassen sich per Drag & Drop verschieben. Angefasst wird ein Eintrag
an seinem Typ-Kürzel.

- Innerhalb eines Teilmodells, einer Collection oder einer Liste ändert das
  Ziehen die Reihenfolge.
- Auf ein anderes Teilmodell, eine andere Collection oder Liste gezogen, wird
  das Element dorthin verschoben.
- Konzeptbeschreibungen lassen sich unter **ConceptDescriptions** neu ordnen.

Während des Ziehens zeigt ein grüner Rahmen ein erlaubtes Ziel, ein roter ein
nicht erlaubtes. AAS, Teilmodelle und die Knoten **ConceptDescriptions** und
**SupplementalFiles** lassen sich nicht verschieben.

## Löschen

**Löschen** im Menü (⋮) eines Eintrags entfernt ihn nach einer Rückfrage aus
dem Baum. Wie jede Änderung wird das Löschen erst mit **Speichern** wirksam
und lässt sich bis dahin mit **Rückgängig** oder **Reset** zurücknehmen.

Beim Löschen eines Teilmodells fragt der Designer zusätzlich, ob das
Teilmodell im Repository bestehen bleiben soll. Bei „Nein“ wird es beim
Speichern auch dort gelöscht.

:::warning
Ist das Teilmodell noch weiteren AAS zugeordnet, werden deren Verweise
ungültig, wenn es im Repository gelöscht wird.
:::

## Teilmodelle aus JSON importieren

Der JSON-Import im Teilmodell-Dialog akzeptiert ein einzelnes Objekt mit
`modelType: Submodel`. Ein AAS-Environment-Wrapper oder Concept Descriptions
sind dafür nicht erforderlich. Die Vorprüfung verwendet denselben Parser wie
der eigentliche Import; andere Modelltypen werden dort abgewiesen.

Der Dialog **JSON-Import** nimmt das JSON als Text oder über **Datei
auswählen** als Datei entgegen. Ist der Inhalt kein gültiges Teilmodell,
meldet der Dialog „Das angegebene JSON ist kein gültiges Teilmodell.“ mit der
Fundstelle; **Import** bleibt dann gesperrt. **Element aus JSON** an einem
Teilmodell oder einer Collection funktioniert genauso für einzelne Elemente.

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

## Assistenten im Editor

Für einige Teilmodelle bietet der Editor Assistenten an. Sie erscheinen als
Buttons über der Ansicht des gewählten Eintrags oder im Menü unter
**Hinzufügen › Aus Erweiterung**:

- **Asset Interfaces Description**: **Interface hinzufügen**, ein Interface
  **Mit Assistent bearbeiten** oder **Interface löschen**
- **Capability Description**: **Capability hinzufügen** und **Mit Assistent
  bearbeiten**
- **Carbon Footprint**: **Eintrag hinzufügen** und **Mit Assistent bearbeiten**
- **Handover Documentation**: **Aus Erweiterung › Dokument** legt ein Dokument
  an
- **Kontaktinformationen**: **Aus Erweiterung › ContactInformation**
- **Stückliste** (Hierarchical Structures): wird in der Ansicht als Diagramm
  gezeigt

Die Abläufe der einzelnen Assistenten beschreibt das Kapitel
[Assistenten im Editor](./editor-assistenten.md).

## Teilmodell einzeln bearbeiten

Ein Teilmodell lässt sich auch ohne seine AAS bearbeiten: ein Klick auf
eine Zeile in der Liste **Teilmodelle** öffnet den Teilmodell-Editor. Er
sieht aus wie der Editor, der Baum enthält aber nur das Teilmodell.

![Teilmodell-Editor](/img/designer/teilmodell-bearbeiten.png)

- **Validieren** prüft nur das Teilmodell und seine Konzeptbeschreibungen.
- **Speichern** speichert zuerst die zugehörigen Konzeptbeschreibungen und
  dann das Teilmodell. Einen Eintrag im Änderungsprotokoll legt es nicht an.
- **i** öffnet die **Teilmodell-Information** mit ID, idShort, der Anzahl der
  Dateien, Konzeptbeschreibungen und AAS-Referenzen sowie den AAS, die das
  Teilmodell verwenden. Diesen Button gibt es nur im Teilmodell-Editor.
- Papierkorb und **Reset** fehlen hier.
- Wer den Teilmodell-Editor mit ungespeicherten Änderungen verlässt, wird wie
  im Editor gefragt, ob ohne Speichern fortgefahren werden soll.

Das ist praktisch für Teilmodelle, die mehreren AAS zugeordnet sind: Eine
Änderung wirkt sich auf alle diese AAS aus.

## Digitaler Produktpass

Ist für die Infrastruktur ein DPP-Dienst eingerichtet, zeigt der Editor bei
der AAS die Leiste **DPP** mit dem Button **DPP-Metadaten anlegen**. Wie ein
Pass angelegt und veröffentlicht wird, steht unter
[Digitaler Produktpass](./dpp.md).
