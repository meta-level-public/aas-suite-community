---
sidebar_position: 9
title: Konzeptbeschreibungen
description: Was Konzeptbeschreibungen sind, woher sie kommen und wie man sie in der Liste findet und bearbeitet.
stichworte:
  Konzeptbeschreibung: ''
  Concept Description: ''
  IEC 61360: datendefinition
  Datendefinition: datendefinition
  Fall von (isCaseOf): konzeptbeschreibung-bearbeiten
  Referenzsysteme: in-referenzsystemen-suchen
  ECLASS: in-referenzsystemen-suchen
  Einheit-ID: in-referenzsystemen-suchen
  QUDT: in-referenzsystemen-suchen
quellen:
  - frontend/libs/aas-designer-core/src/lib/cds-list/cds-list.component.html
  - frontend/libs/aas-designer-core/src/lib/cds-list/cds-list.component.ts
  - frontend/libs/aas-designer-core/src/lib/cd-edit/cd-edit.component.html
  - frontend/libs/aas-designer-core/src/lib/cd-edit/cd-edit.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/v3-concept-description/v3-concept-description.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/v3-concept-description/v3-concept-description.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/v3-id/v3-id.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/v3-id/v3-id.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/v3-embedded-data-specification/v3-embedded-data-specification.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/v3-embedded-data-specification/v3-embedded-data-specification.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/data-specification-content/data-specification-content.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/data-specification-content/data-specification-content.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/additional-lookup-sources/additional-lookup-sources.component.ts
  - frontend/libs/aas-designer-assets/src/lib/assets/lookups/additional-lookup-sources.json
  - frontend/apps/aas-designer-community/src/app/app.routes.ts
  - frontend/libs/translations/i18n/de.json
---

# Konzeptbeschreibungen

Eine Konzeptbeschreibung (Concept Description, CD) legt fest, was ein Element
bedeutet: Name in mehreren Sprachen, Definition, Einheit und Datentyp. Ein
Element verweist über seine **Semantic ID** auf die passende
Konzeptbeschreibung (Hintergrund unter
[AAS-Grundlagen](./grundlagen.md#semantik)).

## Wo Konzeptbeschreibungen herkommen

- Beim Einfügen einer [IDTA-Vorlage](./idta-vorlagen.md) werden die
  Konzeptbeschreibungen der Vorlage mit übernommen, sofern sie enthalten
  sind.
- Im [Editor](./editor.md#werte-bearbeiten) zeigt der Abschnitt
  **Semantische Beschreibung** an, ob zur Semantic ID eines Elements eine
  Beschreibung im Repository vorhanden ist. Fehlt sie, lässt sie sich dort
  direkt anlegen.
- Im Baum des Editors stehen die Konzeptbeschreibungen der AAS unter
  **Konzeptbeschreibungen**.

:::info Enterprise
In der Enterprise-Edition legt der KI-Assistent AASsi beim Übernehmen zu jeder
neuen Eigenschaft mit ECLASS-Kennung eine Konzeptbeschreibung an. Vorhandene
Konzeptbeschreibungen mit derselben Kennung bleiben unverändert.
:::

## Liste der Konzeptbeschreibungen

**Konzeptbeschreibungen** im Hauptmenü listet alle Konzeptbeschreibungen der
gewählten Infrastruktur, siehe
[AAS verwalten](./aas-verwalten.md#teilmodelle-und-konzeptbeschreibungen).
Das Menü (⋮) einer Zeile bietet **Bearbeiten** und **Löschen**. **Löschen**
fragt vorher nach.

Eine neue Konzeptbeschreibung lässt sich in der Liste nicht anlegen; neue
Konzeptbeschreibungen entstehen im Editor einer AAS (siehe oben).

:::note Schreibgeschützte Infrastruktur
Ist die gewählte Infrastruktur schreibgeschützt, bietet das Menü weder
**Bearbeiten** noch **Löschen** an.
:::

## Konzeptbeschreibung bearbeiten

**Bearbeiten** öffnet die Seite **Beschreibung bearbeiten**. Dafür ist die
Rolle zum Bearbeiten von AAS, Organisationsadministration oder
Systemadministration nötig.

![Konzeptbeschreibung bearbeiten](/img/designer/konzeptbeschreibung-bearbeiten.png)

Die Seite ist in aufklappbare Abschnitte gegliedert:

| Abschnitt | Inhalt |
|---|---|
| Details | ID, idShort, Beschreibung und Anzeigename (mehrsprachig) |
| Administrative Informationen | Version, Revision und weitere Verwaltungsangaben |
| Fall von | Verweise auf Definitionen, denen diese Beschreibung entspricht (`isCaseOf`), z. B. ein ECLASS-Merkmal; anfangs zugeklappt |
| Datendefinition | Die eigentliche Definition nach IEC 61360 |

Für die **ID** bieten die Buttons daneben **IRI generieren**,
**GUID generieren** und **Durchsuchen** an. **Durchsuchen** öffnet die Suche
in den Katalogen ECLASS und VEC, siehe
[In Referenzsystemen suchen](#in-referenzsystemen-suchen).

### Datendefinition

Unter **Datendefinition** steht die Definition nach IEC 61360. Eine
Konzeptbeschreibung kann mehrere Definitionen enthalten.

![Datendefinition einer Konzeptbeschreibung](/img/designer/konzeptbeschreibung-datendefinition.png)

| Feld | Bedeutung |
|---|---|
| Bevorzugter Name | Name des Merkmals in mehreren Sprachen (Pflicht) |
| Kurzname | Kurze Bezeichnung, z. B. für Tabellen |
| Definition | Erklärung des Merkmals in mehreren Sprachen |
| Quelle der Definition | Woher die Definition stammt |
| Einheit, Einheit-ID, Symbol | Maßeinheit des Werts, z. B. `°C` |
| Datentyp | Datentyp nach IEC 61360, z. B. String, Integer oder Real |
| Format | Hinweis zum Werteformat |
| Werteliste | Erlaubte Werte, z. B. für Auswahllisten |
| Wert | Fester Wert des Merkmals |
| Leveltyp | Ob Minimum, Maximum, Nennwert oder typischer Wert angegeben wird |

Jede Definition steht in einem eigenen aufklappbaren Abschnitt
(**Definition 1**, **Definition 2** …). Rechts daneben stehen:

- **Definition löschen** entfernt diese Definition.
- **Suche in Referenzsystemen** übernimmt eine vorhandene Definition, statt
  sie von Hand zu erfassen.

**Zusätzliche Definition einfügen** ergänzt eine weitere Definition,
**Ganzen Block entfernen** entfernt alle Definitionen auf einmal. Hat die
Konzeptbeschreibung noch keine Datendefinition, legt **Hinzufügen** die erste
an.

### In Referenzsystemen suchen

An drei Stellen lässt sich eine Angabe aus einem Referenzsystem übernehmen.
Der Dialog bietet je Stelle eigene Reiter:

| Stelle | Reiter | Was übernommen wird |
|---|---|---|
| **Durchsuchen** neben der **ID** | **ECLASS**, **VEC** | ECLASS: die IRDI als ID sowie Bezeichnung, Definition, Datentyp und Einheit in die Datendefinition. VEC: ID, idShort, Anzeigename und Beschreibung sowie die Angaben in die erste Datendefinition |
| **Suche in Referenzsystemen** an einer Definition | **ECLASS**, **VEC**, **Sonstiges** | Die Angaben des gewählten Merkmals in diese Definition |
| Lupe an der **Einheit-ID** | **ECLASS**, **QUDT**, **SI**, **Sonstiges** | Die Kennung der Einheit; bei ECLASS auch die **Einheit** |

Der Reiter **Sonstiges** sucht nicht selbst, sondern nennt weitere
Klassifikationssysteme, z. B. ETIM, UNSPSC oder GPC, mit einer kurzen
Erklärung und einem Link auf deren Website. **Schließen** beendet den Dialog
ohne Übernahme.

**Speichern** schreibt die Konzeptbeschreibung in das CD-Repository der
Infrastruktur, **Schließen** kehrt ohne Speichern zurück.

:::note Änderungen wirken überall
Eine Konzeptbeschreibung kann von vielen AAS genutzt werden. Eine Änderung
wirkt sich auf alle Elemente aus, die über ihre Semantic ID darauf verweisen.
:::
