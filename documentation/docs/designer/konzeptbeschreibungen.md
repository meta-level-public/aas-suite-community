---
sidebar_position: 9
title: Konzeptbeschreibungen
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

## Liste der Konzeptbeschreibungen

**Konzeptbeschreibungen** im Hauptmenü listet alle Konzeptbeschreibungen der
gewählten Infrastruktur, siehe
[AAS verwalten](./aas-verwalten.md#teilmodelle-und-konzeptbeschreibungen).
Das Menü (⋮) einer Zeile bietet **Bearbeiten** und **Löschen**.

## Konzeptbeschreibung bearbeiten

**Bearbeiten** öffnet die Seite **Beschreibung bearbeiten**. Dafür ist die
Rolle zum Bearbeiten von AAS nötig.

![Konzeptbeschreibung bearbeiten](/img/designer/konzeptbeschreibung-bearbeiten.png)

Die Seite ist in aufklappbare Abschnitte gegliedert:

| Abschnitt | Inhalt |
|---|---|
| Details | ID, idShort, Beschreibung und Anzeigename (mehrsprachig) |
| Administrative Informationen | Version, Revision und weitere Verwaltungsangaben |
| Fall von | Verweise auf Definitionen, denen diese Beschreibung entspricht (`isCaseOf`), z. B. ein ECLASS-Merkmal |
| Datendefinition | Die eigentliche Definition nach IEC 61360 |

Für die **ID** bieten die Buttons daneben an, eine IRI oder eine GUID zu
erzeugen oder in Referenzsystemen nach einer vorhandenen ID zu suchen.

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
| Leveltyp | Ob Minimum, Maximum, Nennwert oder typischer Wert angegeben wird |

**Suche in Referenzsystemen** übernimmt eine vorhandene Definition, statt sie
von Hand zu erfassen. **Zusätzliche Definition einfügen** ergänzt eine weitere
Definition, **Definition löschen** entfernt die aktuelle.

**Speichern** schreibt die Konzeptbeschreibung in das CD-Repository der
Infrastruktur, **Schließen** kehrt ohne Speichern zurück.

:::note Änderungen wirken überall
Eine Konzeptbeschreibung kann von vielen AAS genutzt werden. Eine Änderung
wirkt sich auf alle Elemente aus, die über ihre Semantic ID darauf verweisen.
:::
