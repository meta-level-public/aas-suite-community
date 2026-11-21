---
sidebar_position: 7
title: Import und Export
description: Beschreibt den Export als JSON oder AASX, den Import von AASX- und JSON-Dateien mit Original- oder abgeleitetem Import und das Kopieren in eine andere Infrastruktur.
stichworte:
  Export: aas-exportieren
  AASX exportieren: aas-exportieren
  Metamodell-Version: aas-exportieren
  Import: aas-importieren
  Originalimport: aas-importieren
  Abgeleiteter Import: aas-importieren
  AAS überschreiben: wenn-die-aas-schon-existiert
  Teilimport: fehlerhafte-teilmodelle
  Importieren in: in-eine-andere-infrastruktur-kopieren
quellen:
  - frontend/libs/aas-designer-core/src/lib/shells-list/shells-list.component.ts
  - frontend/libs/aas-designer-core/src/lib/shells-list/shells-list.actions.ts
  - frontend/libs/aas-designer-core/src/lib/shells-list/upload-aas-dialog/upload-aas-dialog.component.html
  - frontend/libs/aas-designer-core/src/lib/shells-list/upload-aas-dialog/upload-aas-dialog.component.ts
  - frontend/libs/aas-designer-core/src/lib/general/aasx-export/aasx-export.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/v3-editor.component.ts
  - frontend/libs/translations/i18n/de.json
---

# Import und Export

AAS lassen sich als Datei herunterladen, aus Dateien importieren und zwischen
Infrastrukturen kopieren. Zu den Formaten siehe
[AAS-Grundlagen](./grundlagen.md#austauschformate).

## AAS exportieren

Im Menü (⋮) einer AAS in der [Liste der Verwaltungsschalen](./aas-verwalten.md)
steht **Exportieren** mit zwei Einträgen:

![Menü Exportieren](/img/designer/shells-menue-exportieren.png)

- **Export \*.json** lädt die AAS sofort als `<idShort>.json` herunter. Die
  Datei enthält das Modell, aber keine angehängten Dateien.
- **Export \*.aasx** öffnet einen Dialog für das AASX-Paket:

![Dialog Exportieren](/img/designer/export-aasx.png)

| Einstellung | Bedeutung |
|---|---|
| Aasx Exportformat | Speicherformat im Paket: XML oder JSON |
| AAS Metamodell-Version | 3.1 (Standard) oder 3.0, für Empfänger, die die neuere Version noch nicht lesen |
| Inhalt | Welche Teilmodelle ins Paket kommen. Links stehen die verfügbaren, rechts die ausgewählten Teilmodelle; die Pfeile dazwischen verschieben sie. |

**Herunterladen** erzeugt das Paket. Bei großen AAS mit vielen Dateien kann
das einen Moment dauern.

Im Editor ist der AASX-Export auch über **Weitere Aktionen** (⋮ in der
Werkzeugleiste) erreichbar, allerdings nur ohne ungespeicherte Änderungen.

### Mehrere AAS auf einmal

In der Liste lassen sich AAS über die Kästchen am Zeilenanfang markieren. Das
Menü im Spaltenkopf bietet dann **Herunterladen** (alle markierten AAS als
ZIP-Datei) und **Löschen**. **Löschen** fehlt, wenn die Infrastruktur nur
gelesen werden darf.

## AAS importieren

**Hinzufügen › AASX hochladen** bzw. **JSON hochladen** in der Liste der
Verwaltungsschalen öffnet den Dialog **Bestehende AAS hochladen**:

![Dialog Bestehende AAS hochladen](/img/designer/import-aasx.png)

1. Eine oder mehrere Dateien über **Dateien wählen** oder per Drag & Drop
   hinzufügen.
2. Den **Importmodus** wählen:
   - **Originalimport**: übernimmt die AAS 1:1 mit ihren Kennungen. Dieser
     Modus ist richtig, wenn man Eigentümer der AAS ist und genau diese hier
     weiterbearbeiten will.
   - **Abgeleiteter Import**: die AAS erhält eine neue Kennung, die
     ursprüngliche bleibt als Verweis erhalten. Dieser Modus ist richtig für
     AAS anderer Hersteller, die man nur im eigenen System ergänzen möchte.
3. Bei Bedarf **ggf. bestehende AAS überschreiben** ankreuzen, siehe unten.
4. **Speichern** startet den Import. Der Button ist erst aktiv, wenn
   mindestens eine Datei und ein Importmodus gewählt sind. Eine einzelne Datei
   öffnet danach direkt den [Editor](./editor.md).

### Wenn die AAS schon existiert

Beim Originalimport prüft der Designer, ob es eine AAS mit derselben Kennung
schon gibt. Dann erscheint die Meldung, dass mindestens eine AAS bereits
existiert. Zwei Wege:

- **ggf. bestehende AAS überschreiben** ankreuzen und erneut importieren.
  Die vorhandene AAS wird dabei ersetzt.
- Den **Abgeleiteten Import** wählen, um eine zweite, eigenständige AAS
  anzulegen.

### Fehlerhafte Teilmodelle

Lehnt das Repository einzelne Teilmodelle einer Datei ab, zeigt der Designer
eine Übersicht:

- **Zusammenfassung** und **Betroffene Submodelle**: welche Teilmodelle
  ausgelassen werden, jeweils mit Grund (z. B. ein fehlender englischer
  Preferred Name in einer eingebetteten Data Specification), und welche
  weiterhin importiert werden.
- **Bedeutung**: was Fortfahren und Zurückgehen bewirken.
- **Technische Details anzeigen** blendet die Antwort des Repositorys ein.

**Ohne fehlerhafte Submodelle importieren** übernimmt den Rest, **Zurück**
kehrt zum Upload zurück, z. B. um die Quelldatei zu korrigieren.

Bei mehreren Dateien sind die fehlerfreien Dateien bereits importiert. Die
Übersicht listet nur die betroffenen Dateien; für jede gibt es einen eigenen
Button **Ohne fehlerhafte Submodelle importieren** und, falls die AAS schon
existiert, das Kästchen **ggf. bestehende AAS überschreiben**.

Ist die Datei insgesamt nicht lesbar, meldet der Designer „Dieses Paket
enthält nicht lesbare Daten“ mit einem Hinweis auf die Ursache.

### Einzelne Teilmodelle importieren

Ein einzelnes Teilmodell als JSON lässt sich im Editor über das Menü der AAS
einfügen: **Hinzufügen › Teilmodell aus JSON**, siehe
[Editor](./editor.md#teilmodelle-aus-json-importieren).

## In eine andere Infrastruktur kopieren

Nutzt die Organisation mehrere AAS-Infrastrukturen, steht im Menü einer AAS
**Importieren in …** mit allen anderen beschreibbaren Infrastrukturen. Der
Eintrag fehlt, wenn es keine weitere gibt.

- Die AAS wird **kopiert**, das Original bleibt erhalten.
- AAS und Teilmodelle erhalten in der Ziel-Infrastruktur neue Kennungen, die
  Asset-ID bleibt gleich. So entstehen keine Konflikte mit vorhandenen AAS.

Enthält die AAS ein Teilmodell für Produktänderungsmitteilungen (PCN), fragt
der Designer nach dem Kopieren, ob Aktualisierungen zu diesem Produkt
abonniert werden sollen.
