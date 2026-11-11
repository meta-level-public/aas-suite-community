---
sidebar_position: 7
title: Import und Export
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

Im Editor ist der Export auch über **Weitere Aktionen** (⋮ in der
Werkzeugleiste) erreichbar.

### Mehrere AAS auf einmal

In der Liste lassen sich AAS über die Kästchen am Zeilenanfang markieren. Das
Menü im Spaltenkopf bietet dann **Herunterladen** (alle markierten AAS als
ZIP-Datei) und **Löschen**.

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
3. **Speichern** startet den Import. Eine einzelne Datei öffnet danach direkt
   den [Editor](./editor.md).

### Wenn die AAS schon existiert

Beim Originalimport prüft der Designer, ob es eine AAS mit derselben Kennung
schon gibt. Dann erscheint die Meldung, dass mindestens eine AAS bereits
existiert. Zwei Wege:

- **ggf. bestehende AAS überschreiben** ankreuzen und erneut importieren.
  Die vorhandene AAS wird dabei ersetzt.
- Den **Abgeleiteten Import** wählen, um eine zweite, eigenständige AAS
  anzulegen.

### Fehlerhafte Teilmodelle

Enthält eine Datei Teilmodelle, die nicht gelesen werden können, zeigt der
Designer, welche betroffen sind. **Ohne fehlerhafte Submodelle importieren**
übernimmt den Rest. Bei mehreren Dateien geschieht das für jede Datei
einzeln.

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
