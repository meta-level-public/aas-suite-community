---
sidebar_position: 11
title: Schnipsel
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
3. Einen **Namen des Schnipsel** und optional eine **Beschreibung** eingeben
   und **Speichern**.

![Dialog Schnipsel erstellen](/img/designer/schnipsel-speichern.png)

Gespeichert wird der Eintrag mit allen enthaltenen Elementen und Werten. Ein
neuer Schnipsel ist zunächst **privat**, also nur für die Person sichtbar,
die ihn angelegt hat.

## Schnipsel einfügen

1. Im Editor das Menü (⋮) des Eintrags öffnen, unter dem der Schnipsel
   eingefügt werden soll.
2. **Hinzufügen › Schnipsel** wählen.
3. Im Dialog **Schnipsel einfügen** über das Menü der Zeile **Einfügen**
   wählen.

![Dialog Schnipsel einfügen](/img/designer/schnipsel-einfuegen.png)

Der Dialog zeigt nur Schnipsel, die an dieser Stelle passen:

| Eingefügt unter | Angebotene Schnipsel |
|---|---|
| AAS | Teilmodelle |
| Teilmodell, Collection (SMC) oder Entity | Elemente |
| Konzeptbeschreibungen | Konzeptbeschreibungen |

Wie jede Änderung im Editor wird der eingefügte Schnipsel erst mit
**Speichern** dauerhaft übernommen.

## Schnipsel verwalten

**Mein Bereich › Schnipsel** listet alle Schnipsel, die man selbst angelegt
hat oder die in der Organisation geteilt sind.

![Liste der Schnipsel](/img/designer/schnipsel-liste.png)

Das Menü (⋮) einer Zeile bietet:

| Aktion | Bedeutung |
|---|---|
| Ansehen | Zeigt den Inhalt des Schnipsels |
| Mit Organisation teilen | Macht den Schnipsel für alle Mitglieder der Organisation verfügbar |
| Freigabe aufheben | Macht einen geteilten Schnipsel wieder privat |
| Löschen | Entfernt den Schnipsel; bereits eingefügte Kopien in AAS bleiben erhalten |

Teilen, Freigabe aufheben und Löschen stehen nur der Person zur Verfügung,
die den Schnipsel angelegt hat. Das Kennzeichen am Zeilenende zeigt, ob ein
Schnipsel **Privat** oder für die **Organisation** freigegeben ist.
