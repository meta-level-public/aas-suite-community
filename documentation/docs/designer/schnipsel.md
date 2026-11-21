---
sidebar_position: 11
title: Schnipsel
description: Wie man Teile einer AAS als Schnipsel speichert, in andere AAS einfügt, mit der Organisation teilt und verwaltet.
stichworte:
  Schnipsel: ''
  Baustein: ''
  Als Schnipsel speichern: schnipsel-speichern
  Schnipsel einfügen: schnipsel-einfügen
  Mit Organisation teilen: schnipsel-verwalten
  Freigabe aufheben: schnipsel-verwalten
  Privat: schnipsel-verwalten
quellen:
  - frontend/libs/aas-designer-core/src/lib/catalog/snippets-catalog/snippets-catalog.component.html
  - frontend/libs/aas-designer-core/src/lib/catalog/snippets-catalog/snippets-catalog.component.ts
  - frontend/libs/aas-designer-core/src/lib/catalog/service/snippet-catalog.service.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/dialogs/save-snippet/v3-save-snippet-dialog.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/v3-context-menu-model.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree/v3-tree.component.html
  - frontend/libs/translations/i18n/de.json
---

# Schnipsel

Schnipsel sind gespeicherte Bausteine: ein Teilmodell, eine Collection, eine
einzelne Eigenschaft oder eine Konzeptbeschreibung, die sich in andere AAS
einfügen lassen. Typische Beispiele sind eine Herstelleradresse, eine
Gruppe immer gleicher technischer Daten oder ein vorbereitetes Teilmodell mit
den Feldern, die die eigene Organisation immer verwendet.

## Schnipsel speichern

1. Im [Editor](./editor.md) das Menü (⋮) des gewünschten Eintrags im Baum
   öffnen.
2. **Speichern als... › Als Schnipsel speichern** wählen.
3. Im Dialog **Schnipsel erstellen** einen **Name des Schnipsel** (Pflicht)
   und optional eine **Beschreibung** eingeben und **Speichern** wählen.

![Dialog Schnipsel erstellen](/img/designer/schnipsel-speichern.png)

Gespeichert wird der Eintrag mit allen enthaltenen Elementen und Werten. Ein
neuer Schnipsel ist zunächst **privat**, also nur für die Person sichtbar,
die ihn angelegt hat.

## Schnipsel einfügen

1. Im Editor das Menü (⋮) des Eintrags öffnen, unter dem der Schnipsel
   eingefügt werden soll.
2. **Hinzufügen › Schnipsel** wählen.
3. Im Dialog **Schnipsel einfügen** über das Menü (⋮) der Zeile **Einfügen**
   wählen.

![Dialog Schnipsel einfügen](/img/designer/schnipsel-einfuegen.png)

Der Dialog zeigt nur Schnipsel, die an dieser Stelle passen:

| Eingefügt unter | Angebotene Schnipsel |
|---|---|
| AAS | Teilmodelle |
| Teilmodell, Collection (SMC) oder Entity | Elemente |
| Konzeptbeschreibungen | Konzeptbeschreibungen |

Passt kein Schnipsel, zeigt der Dialog „Es gibt keine Schnipsel die an
dieser Stelle eingefügt werden können.“

Wie jede Änderung im Editor wird der eingefügte Schnipsel erst mit
**Speichern** dauerhaft übernommen.

## Schnipsel verwalten

**Mein Bereich › Schnipsel** listet alle Schnipsel, die man selbst angelegt
hat oder die in der Organisation geteilt sind.

![Liste der Schnipsel](/img/designer/schnipsel-liste.png)

Die Tabelle zeigt **Name**, **Typ**, **Angelegt am**, **Geändert am**,
**Erstellt von** und die Freigabe. Ein Klick auf die Spaltenüberschrift
sortiert, die Zeile darunter filtert: nach Text (Name, Erstellt von), nach
Datum oder über eine Auswahl (Typ, Freigabe). Hat ein Schnipsel eine
Beschreibung, steht sie gekürzt unter dem Namen; ein Klick darauf zeigt sie
vollständig.

Das Menü (⋮) einer Zeile bietet:

| Aktion | Bedeutung |
|---|---|
| Ansehen | Öffnet die **Schnipsel Ansicht** mit Name, Beschreibung und Inhalt (Name, Typ und Wert der Elemente) |
| Mit Organisation teilen | Macht den Schnipsel für alle Mitglieder der Organisation verfügbar |
| Freigabe aufheben | Macht einen geteilten Schnipsel wieder privat |
| Löschen | Entfernt den Schnipsel; bereits eingefügte Kopien in AAS bleiben erhalten |

Teilen, Freigabe aufheben und Löschen fragen vorher nach. Sie stehen nur der
Person zur Verfügung, die den Schnipsel angelegt hat. Das Kennzeichen am
Zeilenende zeigt, ob ein Schnipsel **Privat** oder für die **Organisation**
freigegeben ist.
