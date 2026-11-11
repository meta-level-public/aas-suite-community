---
sidebar_position: 10
title: Validierung
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
| IDs validieren | Ob die Kennungen der AAS und ihrer Teilmodelle im System eindeutig sind; nur bei gespeicherter AAS |
| Änderungen anzeigen | Die ungespeicherten Änderungen gegenüber dem gespeicherten Stand, für Fachleute |

Im [Teilmodell-Editor](./editor.md#teilmodell-einzeln-bearbeiten) prüft
**Validieren** nur das Teilmodell und seine Konzeptbeschreibungen.

:::info Beim Speichern wird nicht automatisch geprüft
Eine AAS lässt sich auch mit Fehlern speichern. So kann man eine AAS
schrittweise aufbauen. Vor dem Weitergeben sollte sie aber fehlerfrei sein.
:::

## Ergebnis lesen

Ist alles in Ordnung, meldet der Designer „Keine Validierungsfehler
gefunden“. Andernfalls öffnet sich der Dialog **Validierungsergebnisse**:

![Dialog Validierungsergebnisse](/img/designer/validierung-ergebnis.png)

- Jede Zeile ist ein Fehler. Die Meldungen stammen aus der Prüfbibliothek
  und sind englisch.
- **Gehe zum Problem** springt im Baum zu dem betroffenen Element.
- **Erweitert** zeigt zusätzlich den **Objektpfad** des Elements und die
  verletzte Regel (**Constraint**, z. B. `AASd-022`). Das hilft, wenn das
  Element im Baum schwer zu finden ist.
- Für häufige Fehler bietet der Dialog eine Korrektur per Klick an, z. B.
  einen zu langen Wert kürzen, einen Eintrag löschen oder einen Datentyp
  korrigieren. Mit **Alle …** wird dieselbe Korrektur auf alle gleichartigen
  Fehler angewendet.

Nach der Prüfung zeigt die Werkzeugleiste ein Warnsymbol mit der Anzahl der
Fehler. Ein Klick darauf öffnet das Ergebnis erneut. Zusätzlich markiert der
Editor fehlerhafte Angaben direkt am Element mit einem roten Hinweis.

## Häufige Fehler

| Meldung (Auszug) | Ursache | Lösung |
|---|---|---|
| `... must specify unique languages.` | Ein mehrsprachiger Text, z. B. Anzeigename oder Kurzname, enthält dieselbe Sprache zweimal | Doppelte Sprachzeile löschen |
| `... must be either not set or have at least one item.` | Eine Liste ist vorhanden, aber leer, z. B. eine Beschreibung ohne Text | Werte ergänzen oder den leeren Block entfernen |
| `ID-shorts of the value must be unique.` bzw. `Constraint AASd-022` | Zwei Elemente auf derselben Ebene haben denselben idShort | Eines der Elemente umbenennen |
| `ID-short of Referables shall only feature letters, digits, ...` | Der idShort enthält Leerzeichen oder Sonderzeichen oder beginnt nicht mit einem Buchstaben | Nur Buchstaben, Ziffern, `_` und `-` verwenden, mit einem Buchstaben beginnen |
| `The value must match the value type.` | Der Wert passt nicht zum Datentyp, z. B. Text in einer Zahl | Wert oder Datentyp korrigieren |
| `The value must not be empty.` | Ein Pflichttext ist leer | Text eintragen |

## Kennungen prüfen und neu aufbauen

**IDs validieren** öffnet den Dialog **ID Validierung**. Die AAS muss dafür
gespeichert sein. Der Dialog listet die Kennungen der AAS und ihrer
Teilmodelle mit idShort und Version/Revision und schlägt daneben eine
**Neue ID** vor.

- Oben wird festgelegt, wie neue Kennungen aufgebaut werden: **Schema**
  (`urn:`, `http://` oder `https://`), Herausgeber (Authority), **Einheit**,
  Domäne (z. B. der idShort), Release und Element, jeweils mit wählbarem
  Trennzeichen.
- **Version erhöhen** bzw. **Revision erhöhen** zählen die Version der
  Kennungen hoch, z. B. für eine neue Fassung einer AAS.
- **ID Eindeutigkeit überprüfen** meldet, ob eine der neuen Kennungen im
  System schon vergeben ist.
- **Speichern** übernimmt die neuen Kennungen.
