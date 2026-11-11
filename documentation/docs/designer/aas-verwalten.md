---
sidebar_position: 4
title: AAS verwalten
---

# AAS verwalten

## Verwaltungsschalen

Unter **Shells** im Hauptmenü stehen alle AAS der gewählten AAS-Infrastruktur.

![Liste der Verwaltungsschalen](/img/designer/shells-liste.png)

- Oben rechts wird die **Infrastruktur** gewählt, deren AAS angezeigt
  werden.
- Die Spalten lassen sich sortieren und über die Felder unter den
  Spaltenköpfen filtern. Die Suche oben rechts durchsucht die AAS, z. B. nach
  der Asset-ID.
- Die Spalte **Art des Asset** zeigt, ob es sich um eine Instanz oder einen
  Typ handelt.

Über das Menü am Anfang einer Zeile stehen, je nach Rechten, folgende
Aktionen bereit:

| Aktion | Bedeutung |
|---|---|
| Ansehen | Öffnet die AAS im [Viewer](./viewer.md) |
| Bearbeiten | Öffnet die AAS im [Editor](./editor.md) |
| Löschen | Entfernt die AAS aus der Infrastruktur |
| Importieren in … | Kopiert die AAS in eine andere Infrastruktur, siehe [Import und Export](./import-export.md#in-eine-andere-infrastruktur-kopieren) |
| Erweitert › Feed Mapping erstellen | Ordnet Felder einer externen Datenquelle (z. B. einer CSV-Datei) den Elementen dieser AAS zu, um daraus weitere AAS nach ihrem Muster zu erzeugen |
| Erweitert › Registry-Korrektur | Zeigt den Registry-Eintrag (Descriptor) der AAS und ihrer Teilmodelle und erlaubt, z. B. falsche Endpunkt-Adressen zu korrigieren |
| Erweitert › Duplizieren | Legt eine Kopie mit neuen Kennungen an, siehe [Typ und Instanz](./typ-und-instanz.md#duplizieren) |
| Erweitert › Instanz erstellen | Erzeugt aus einer Typ-AAS eine Instanz, siehe [Typ und Instanz](./typ-und-instanz.md#instanz-aus-einem-typ-erstellen) |
| Exportieren | Lädt die AAS als AASX- oder JSON-Datei herunter, siehe [Import und Export](./import-export.md) |
| Link zum Teilen erzeugen | Erstellt einen Link für Personen ohne Zugang, siehe [Geteilte Links](./geteilte-links.md) |

Auf schreibgeschützten Infrastrukturen fehlen die Einträge, die die AAS
verändern. **Importieren in …** erscheint nur, wenn es eine weitere
beschreibbare Infrastruktur gibt.

## Neue AAS hinzufügen

**Hinzufügen** oben rechts bietet mehrere Wege an:

![Menü Hinzufügen in der Liste der Verwaltungsschalen](/img/designer/shells-hinzufuegen.png)

- **Assistenten verwenden**: führt Schritt für Schritt durch das Anlegen,
  siehe [AAS anlegen](./aas-anlegen.md).
- **Leere Verwaltungsschale**: legt eine AAS ohne Inhalte an, die anschließend
  im Editor gefüllt wird.
- **AASX hochladen** und **JSON hochladen**: importieren vorhandene AAS aus
  Dateien, siehe [Import und Export](./import-export.md#aas-importieren).

Existiert eine AAS in keinem Repository mehr, kann sie trotzdem gelöscht
werden. Dabei werden die zugehörigen Einträge aus den Registries und dem
Discovery-Service entfernt.

## Teilmodelle und Konzeptbeschreibungen

**Teilmodelle** listet die Submodels der Infrastruktur, unabhängig davon, zu
welcher AAS sie gehören. Ein Klick auf eine Zeile öffnet das Teilmodell
direkt zum Bearbeiten, siehe [Editor](./editor.md#teilmodell-einzeln-bearbeiten).

![Liste der Teilmodelle](/img/designer/teilmodelle-liste.png)

**Konzeptbeschreibungen** listet die Concept Descriptions. Sie erklären, was
ein Element bedeutet, und werden über die Semantic ID eines Elements
gefunden. Wie sie bearbeitet werden, steht unter
[Konzeptbeschreibungen](./konzeptbeschreibungen.md).

![Liste der Konzeptbeschreibungen](/img/designer/konzeptbeschreibungen-liste.png)
