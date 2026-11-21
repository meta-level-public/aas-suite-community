---
sidebar_position: 10
title: Validierung
description: Wie der Designer eine AAS gegen das Metamodell prüft, wie das Ergebnis zu lesen ist und welche Fehler sich per Klick korrigieren lassen.
stichworte:
  Validierung: ''
  Validierungsergebnisse: ergebnis-lesen
  Constraint: einfach-und-erweitert
  Objektpfad: einfach-und-erweitert
  Korrektur per Klick: fehler-per-klick-korrigieren
  Fehler am Element: fehler-direkt-am-element
  ID Validierung: kennungen-prüfen-und-neu-aufbauen
  Version erhöhen: kennungen-prüfen-und-neu-aufbauen
  Häufige Fehler: häufige-fehler
quellen:
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/v3-editor.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/v3-editor-validation.service.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/v3-editor-validation.service.spec.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/tools/verification-message.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/error-panel/error-panel.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/error-line/error-line.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/id-validator/id-validator.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/id-validator/id-validator.component.ts
  - frontend/libs/aas-designer-core/src/lib/submodel-editor/submodel-editor.component.html
  - frontend/libs/translations/i18n/de.json
---

# Validierung

Die Validierung prüft, ob eine AAS dem Metamodell der AAS-Spezifikation
entspricht. Fehlerhafte AAS werden von anderen Systemen unter Umständen nicht
gelesen, deshalb lohnt sich eine Prüfung vor dem Weitergeben oder
Veröffentlichen.

## Prüfung starten

Der Haken links in der Werkzeugleiste des [Editors](./editor.md) startet die
Prüfung. Der Pfeil daneben bietet weitere Prüfungen:

![Menü der Validierung im Editor](/img/designer/validierung-menue.png)

| Eintrag | Prüft |
|---|---|
| Validieren | Die gesamte AAS gegen die Regeln des Metamodells: Pflichtangaben, Längen, Datentypen und die Bedingungen (Constraints) der Spezifikation |
| IDs validieren | Ob die Kennungen der AAS und ihrer Teilmodelle im System eindeutig sind; nur bei gespeicherter AAS, siehe [Kennungen prüfen und neu aufbauen](#kennungen-prüfen-und-neu-aufbauen) |
| Änderungen anzeigen (für Profis ;-) | Die ungespeicherten Änderungen gegenüber dem gespeicherten Stand als Gegenüberstellung |

Im [Teilmodell-Editor](./editor.md#teilmodell-einzeln-bearbeiten) prüft
**Validieren** nur das Teilmodell und seine Konzeptbeschreibungen.

:::info Beim Speichern wird nicht automatisch geprüft
Eine AAS lässt sich auch mit Fehlern speichern. So kann man eine AAS
schrittweise aufbauen. Vor dem Weitergeben sollte sie aber fehlerfrei sein.
:::

## Ergebnis lesen

Ist alles in Ordnung, meldet der Designer „Keine Validierungsfehler
gefunden.“ Andernfalls öffnet sich der Dialog **Validierungsergebnisse** mit
der Anzahl der Fehler im Titel:

![Dialog Validierungsergebnisse](/img/designer/validierung-ergebnis.png)

- Jede Zeile ist ein Fehler, durchnummeriert in der ersten Spalte.
- Die Spalte **Validierungsfehlermeldung** beschreibt den Fehler. Häufige
  Meldungen sind ins Deutsche übersetzt; seltene Meldungen erscheinen im
  englischen Originaltext der Prüfbibliothek.
- Das Feld unter dem Spaltenkopf filtert die Liste nach einem Textteil der
  Meldung. Ein Klick auf den Spaltenkopf sortiert.
- **Gehe zum Problem** schließt den Dialog und springt im Baum zu dem
  betroffenen Element.

Nach der Prüfung zeigt die Werkzeugleiste ein Warnsymbol mit der Anzahl der
Fehler. Ein Klick darauf öffnet das Ergebnis erneut.

### Einfach und Erweitert

Der Umschalter **Einfach** / **Erweitert** unten im Dialog blendet zwei
weitere Spalten ein:

- **Objektpfad**: der Pfad des Elements in der AAS, z. B.
  `.submodels[0].submodelElements[3]`. Das hilft, wenn das Element im Baum
  schwer zu finden ist. Auch dieser Spalte lässt sich ein Textfilter
  setzen.
- **Constraint**: die verletzte Regel der Spezifikation, z. B. `AASd-022`.
  Die Auswahl unter dem Spaltenkopf zeigt nur Fehler zu einer bestimmten
  Regel.

![Validierungsergebnisse in der erweiterten Ansicht mit den Spalten Objektpfad und Constraint](/img/designer/validierung-erweitert.png)

### Fehler per Klick korrigieren

Für häufige Fehler bietet der Dialog neben **Gehe zum Problem** zwei
Korrekturen an: eine für die einzelne Zeile und eine für alle gleichartigen
Fehler.

| Buttons | Wirkung | Typische Fehler |
|---|---|---|
| **Löschen** / **Alle löschen** | Entfernt die leere Angabe; bei einem mehrsprachigen Text die Sprachzeile ohne Text (bleibt keine Zeile übrig, wird der ganze Text entfernt) | Leere Listen, z. B. eine Beschreibung ohne Text oder leere Datenspezifikationen; leere Pflichttexte wie Einheit, Symbol oder Version; eine Sprachzeile ohne Text; ein leerer Wert, der nicht zum Datentyp passt |
| **Kürzen** / **Alle kürzen** | Kürzt den Text auf 18 Zeichen | Zu lange Kurznamen |
| **Typ korrigieren** / **Typ für alle korrigieren** | Behält die Modellreferenz und setzt den Typ des ersten Schlüssels auf einen passenden Typ: den des Elements mit dieser ID in der AAS (**AssetAdministrationShell**, **Submodel** oder **ConceptDescription**), sonst je nach Verwendung, z. B. **ConceptDescription** für eine Semantic ID, sonst **Identifiable** | Constraint `AASd-123`: Der erste Schlüssel einer Modellreferenz ist kein identifizierbares Element der AAS (AAS, Teilmodell oder Konzeptbeschreibung) |
| **Auf Global ändern** / **Alle auf Global ändern** | Setzt den ersten Schlüssel einer externen Referenz auf **GlobalReference** | Constraint `AASd-122` |
| **Pfad kodieren** / **Alle Pfade kodieren** | Kodiert Leerzeichen und Umlaute in Dateipfaden und Adressen, z. B. `%20` | Ungültige URI in einem Datei-Element |

Nach jeder Korrektur prüft der Designer die AAS erneut und aktualisiert die
Liste.

:::note Korrekturen speichern
Die Korrekturen ändern die AAS nur im Editor. Gespeichert werden sie erst mit
**Speichern**.
:::

### Fehler direkt am Element

Unabhängig von der Prüfung über den Haken zeigt der Editor Fehler direkt beim
gerade bearbeiteten Element an: als roten Hinweis unter dem betroffenen Feld
oder im Bereich **Fehler**, z. B. bei Referenzen, Semantic IDs oder der
Verwaltungsinformation. Dort stehen je nach Fehler Korrekturen wie
**Löschen**, **Konvertiere zu ModelReference** oder
**Externe Referenz reparieren** bereit.

## Häufige Fehler

| Meldung (Auszug) | Ursache | Lösung |
|---|---|---|
| `... must specify unique languages.` | Ein mehrsprachiger Text, z. B. Anzeigename oder Kurzname, enthält dieselbe Sprache zweimal | Doppelte Sprachzeile löschen |
| `... must be either not set or have at least one item.` bzw. „Der Wert muss entweder nicht gesetzt sein oder mindestens ein Element enthalten.“ | Eine Liste ist vorhanden, aber leer, z. B. eine Beschreibung ohne Text | Werte ergänzen oder mit **Löschen** entfernen |
| `ID-shorts of the value must be unique.` bzw. `Constraint AASd-022` | Zwei Elemente auf derselben Ebene haben denselben idShort | Eines der Elemente umbenennen |
| „Die ID-Short darf nur Buchstaben, Ziffern, Bindestriche (-) und Unterstriche (_) enthalten …“ | Der idShort enthält Leerzeichen oder Sonderzeichen oder beginnt nicht mit einem Buchstaben | Nur Buchstaben, Ziffern, `_` und `-` verwenden, mit einem Buchstaben beginnen |
| „Der Wert muss mit dem Datentyp übereinstimmen.“ | Der Wert passt nicht zum Datentyp, z. B. Text in einer Zahl | Wert oder Datentyp korrigieren |
| „Der Wert darf nicht leer sein. …“ | Ein Pflichttext ist leer | Text eintragen oder, wo angeboten, mit **Löschen** entfernen |
| „Der Wert darf maximal 18 Zeichen lang sein.“ | Ein Kurzname ist zu lang | Kürzer fassen oder **Kürzen** |
| „Der Wert muss eine gültige URI sein …“ | Ein Dateipfad oder eine Adresse enthält Leerzeichen oder Umlaute | **Pfad kodieren** |

## Kennungen prüfen und neu aufbauen

**IDs validieren** öffnet den Dialog **ID Validierung**. Die AAS muss dafür
gespeichert sein; sonst meldet der Designer, dass sie zuerst gespeichert
werden muss. Der Dialog listet die Kennungen der AAS und ihrer Teilmodelle
mit **Typ**, **idShort** und **Version / Revision**.

![Dialog ID Validierung mit den Bausteinen neuer Kennungen und der Liste der Kennungen von AAS und Teilmodellen](/img/designer/id-validierung.png)

1. Oben festlegen, wie neue Kennungen aufgebaut werden: **Schema**
   (`urn:`, `http://` oder `https://`), **Organisation** (vorbelegt mit dem
   IRI-Präfix der eigenen Organisation), **Einheit**, **Domäne** (der
   idShort oder ein eigener Wert je Zeile), Release und **ID**. Zwischen den
   Teilen wird jeweils ein **Trenner** gewählt (`/`, `:` und beim letzten Teil
   auch `#`).
2. In der Spalte **Neue ID** die Kennungen anhaken, die geändert werden
   sollen. Der Designer zeigt daneben die neu aufgebaute Kennung; sie lässt
   sich von Hand anpassen.
3. In der Spalte **Neue Version / Revision** festlegen, ob Version und
   Revision Teil der Kennung werden. **Version erhöhen** bzw.
   **Revision erhöhen** zählen sie für alle Zeilen hoch, z. B. für eine neue
   Fassung einer AAS.
4. **ID Eindeutigkeit überprüfen** prüft, ob eine der neuen Kennungen im
   System schon vergeben ist. Betroffene Zeilen bekommen ein Warnsymbol.
5. **Speichern** übernimmt die neuen Kennungen und öffnet die AAS unter
   ihrer neuen Kennung im Editor.

:::warning
**Speichern** prüft die Eindeutigkeit noch einmal. Ist eine Kennung schon
vergeben, bricht der Designer mit der Meldung „Mindestens eine der IDs ist
bereits vorhanden und kann nicht genutzt werden.“ ab und ändert nichts.
:::
