---
sidebar_position: 4
title: AAS verwalten
description: Die Listen der Verwaltungsschalen, Teilmodelle und Konzeptbeschreibungen mit Suche, Filtern, Aktionen je AAS und der Registry-Korrektur.
stichworte:
  Shells: verwaltungsschalen
  Verwaltungsschalen: verwaltungsschalen
  Suche nach AAS: suchen-und-filtern
  AssetID-Suche: suchen-und-filtern
  Spaltenauswahl: spalten-anpassen
  Mehrfachauswahl: mehrere-aas-auf-einmal
  QR-Code: qr-code-für-die-viewerapp
  ViewerApp: qr-code-für-die-viewerapp
  Registry-Korrektur: registry-korrektur
  Duplikate: teilmodelle-und-konzeptbeschreibungen
quellen:
  - frontend/libs/aas-designer-core/src/lib/shells-list/shells-list.component.html
  - frontend/libs/aas-designer-core/src/lib/shells-list/shells-list.component.ts
  - frontend/libs/aas-designer-core/src/lib/shells-list/shells-list.config.ts
  - frontend/libs/aas-designer-core/src/lib/shells-list/shells-list.actions.ts
  - frontend/libs/aas-designer-core/src/lib/shells-list/shells-search/shells-search.component.html
  - frontend/libs/aas-designer-core/src/lib/shells-list/shells-search/shells-search.component.ts
  - frontend/libs/aas-designer-core/src/lib/shells-list/registry-correction/registry-correction.component.html
  - frontend/libs/aas-designer-core/src/lib/shells-list/registry-correction/registry-correction.component.ts
  - frontend/libs/aas-designer-core/src/lib/viewer-setup-code/viewer-setup-code.component.html
  - frontend/libs/aas-designer-core/src/lib/viewer-setup-code/viewer-setup-code.component.ts
  - frontend/libs/aas-designer-core/src/lib/submodels-list/submodels-list.component.html
  - frontend/libs/aas-designer-core/src/lib/submodels-list/submodels-list.component.ts
  - frontend/libs/common-components/src/lib/cursor-paginator/cursor-paginator.component.ts
  - frontend/apps/aas-designer-enterprise/src/app/app.config.ts
  - services/aas-designer/AasDesignerAasApi/Submodels/GetSmList/GetSmListQuery.cs
  - services/aas-designer/AasDesignerSystemManagementApi/Settings/Queries/GetViewerSettings/GetViewerSettingsQuery.cs
  - services/aas-designer/AasDesignerApi/Orga/OrganisationService.cs
  - frontend/libs/translations/i18n/de.json
---

# AAS verwalten

## Verwaltungsschalen

Unter **Shells** im Hauptmenü stehen alle AAS der gewählten AAS-Infrastruktur.

![Liste der Verwaltungsschalen](/img/designer/shells-liste.png)

- Oben rechts wird die **Infrastruktur** gewählt, deren AAS angezeigt
  werden.
- Ein Klick auf eine Zeile öffnet die AAS im [Editor](./editor.md), auf
  schreibgeschützten Infrastrukturen im [Viewer](./viewer.md).
- Die Spalte **Art des Asset** zeigt, ob es sich um eine Instanz oder einen
  Typ handelt.
- Die Liste wird seitenweise geladen. Unten wechseln **Erste Seite** und
  **Weiter** zwischen den Seiten; daneben wird festgelegt, wie viele
  Einträge eine Seite zeigt. **Aktualisieren** (Pfeilkreis oben rechts) lädt
  die Liste neu.

Über das Menü am Anfang einer Zeile stehen, je nach Rechten, folgende
Aktionen bereit:

| Aktion | Bedeutung |
|---|---|
| Ansehen | Öffnet die AAS im [Viewer](./viewer.md) |
| Bearbeiten | Öffnet die AAS im [Editor](./editor.md) |
| Löschen | Entfernt die AAS nach einer Rückfrage aus der Infrastruktur |
| Importieren in ... | Kopiert die AAS in eine andere Infrastruktur, siehe [Import und Export](./import-export.md#in-eine-andere-infrastruktur-kopieren) |
| Erweitert › Registry-Korrektur | Zeigt die Registry-Einträge der AAS und ihrer Teilmodelle und erlaubt, sie zu korrigieren, siehe [Registry-Korrektur](#registry-korrektur) |
| Erweitert › Duplizieren | Legt eine Kopie mit neuen Kennungen an, siehe [Typ und Instanz](./typ-und-instanz.md#duplizieren) |
| Erweitert › Instanz erstellen | Erzeugt aus einer Typ-AAS eine Instanz, siehe [Typ und Instanz](./typ-und-instanz.md#instanz-aus-einem-typ-erstellen) |
| Exportieren › Export \*.aasx bzw. Export \*.json | Lädt die AAS als AASX- oder JSON-Datei herunter, siehe [Import und Export](./import-export.md) |
| Link zum Teilen erzeugen | Erstellt einen Link für Personen ohne Zugang, siehe [Geteilte Links](./geteilte-links.md) |

Auf schreibgeschützten Infrastrukturen fehlen die Einträge, die die AAS
verändern. **Importieren in ...** erscheint nur, wenn es eine weitere
beschreibbare Infrastruktur gibt; **Instanz erstellen** nur bei einer
Typ-AAS.

:::info Enterprise
In der Enterprise-Edition enthält **Erweitert** zusätzlich:

- **Feed Mapping erstellen**: ordnet Felder einer externen Datenquelle (z. B.
  einer CSV-Datei) den Elementen dieser AAS zu, um daraus weitere AAS nach
  ihrem Muster zu erzeugen. Nur mit passender Lizenz und Berechtigung.
- **Im Marktplatz veröffentlichen**: nur mit der Berechtigung zum
  Veröffentlichen im Marktplatz.
:::

### Suchen und filtern

Für die Suche gibt es mehrere Wege:

| Weg | Wirkung |
|---|---|
| Feld **AssetID** oben rechts | Sucht die AAS zu einer Asset-ID über den Discovery-Service. Gibt es genau eine, öffnet sie sich im Viewer. Sonst meldet der Designer „Kein Asset zu dieser ID gefunden“ bzw. „Es wurden mehrere AAS gefunden. Ein Sprung zum Viewer ist nicht möglich.“ |
| **Durchsuchen** (Lupe) | Öffnet den Dialog **Suche nach AAS**, siehe unten |
| Auswahl **Art des Asset** über der Tabelle | Zeigt nur AAS einer Art: **Alle**, **Instanz**, **Typ**, **Rolle** oder **Nicht zutreffend** |
| Felder unter den Spaltenköpfen, Klick auf einen Spaltenkopf | Filtern bzw. sortieren die gerade geladene Seite |

Im Dialog **Suche nach AAS**:

1. **idShort** und/oder **Globale Asset-ID** eintragen.
2. **Durchsuchen**. Der Dialog meldet die Zahl der Treffer.
3. Bei bis zu 20 Treffern stehen sie direkt im Dialog. **Anzeigen** öffnet
   eine AAS im Viewer, **Bearbeiten** im Editor.
4. **Trefferliste** übernimmt alle Treffer in die Tabelle. Solange die
   Tabelle Suchtreffer zeigt, steht oben rechts **Reset**; damit kehrt die
   vollständige Liste zurück.

![Dialog Suche nach AAS mit zwei Treffern zur idShort demoKreiselpumpe](/img/designer/shells-suche.png)

**Reset** im Dialog leert die Suchfelder.

### Spalten anpassen

Die Auswahl links über der Tabelle legt fest, welche Spalten sichtbar sind.
Zur Wahl stehen **Vorschaubild**, **ID**, **idShort**, **Globale Asset-ID**,
**Teilmodelle**, **Produktbezeichnung** und **Art des Asset**. Teilmodelle
und Produktbezeichnung lädt der Designer erst, wenn die Spalte eingeblendet
ist. Das × an einem Eintrag blendet die Spalte wieder aus.

Spalten lassen sich per Drag & Drop umsortieren und in der Breite ändern.
Die gewählten Spalten, ihre Reihenfolge, Breite und die Sortierung merkt sich
der Designer im Browser. Ist keine Spalte gewählt, gilt beim nächsten Aufruf
wieder die Standardauswahl.

### Mehrere AAS auf einmal

Die Kästchen am Zeilenanfang markieren mehrere AAS, das Kästchen im
Spaltenkopf alle der Seite. Das Menü daneben bietet für die markierten AAS:

- **Löschen**: löscht alle markierten AAS nach einer Rückfrage; fehlt auf
  schreibgeschützten Infrastrukturen.
- **Herunterladen**: lädt die markierten AAS gemeinsam herunter, siehe
  [Import und Export](./import-export.md#mehrere-aas-auf-einmal).

### QR-Code für die ViewerApp

Der Button **QR-Code** oben rechts zeigt den Dialog **Setup für ViewerApp**.
Mit diesem Code übernimmt die ViewerApp die Einstellungen der gewählten
Infrastruktur. **QR-Code herunterladen** speichert ihn als PNG-Datei.

:::warning QR-Code nicht weitergeben
Der QR-Code enthält neben den Adressen der Infrastruktur einen persönlichen
API-Schlüssel mit Leserecht (`AASX_READ_API`). Gibt es für die Person und die
Infrastruktur noch keinen gültigen, legt der Designer beim Öffnen des Dialogs
einen an, gültig für ein Jahr. Wer den Code scannt, kann damit AAS und
Teilmodelle der Infrastruktur lesen, aber nicht ändern.
:::

Der Schlüssel erscheint unter [Organisation › Token](./organisation.md#token)
mit der Beschreibung „ViewerApp-QR-Code (nur Lesen)“ und der E-Mail-Adresse
der Person. Dort lässt er sich deaktivieren oder löschen; die ViewerApp
verliert dann den Zugriff. Beim nächsten Öffnen des Dialogs legt der Designer
einen neuen Schlüssel an, der QR-Code muss dann neu gescannt werden.

### Infrastruktur ohne Listenabfrage

Manche Infrastrukturen können keine Liste ihrer AAS liefern. Dann zeigt die
Seite statt der Tabelle den Hinweis „Die ausgewählte Infrastruktur
unterstützt keine Shell-Listenabfrage …“ und ein Suchfeld:

1. Die vollständige AAS-ID in **AAS-ID suchen** eintragen.
2. Lupe oder Eingabetaste.
3. Der Designer zeigt die gefundene AAS mit Asset-Informationen und
   Teilmodellen. **Ansehen** öffnet sie im Viewer, **Bearbeiten** im Editor.

## Neue AAS hinzufügen

**Hinzufügen** oben rechts bietet mehrere Wege an:

![Menü Hinzufügen in der Liste der Verwaltungsschalen](/img/designer/shells-hinzufuegen.png)

- **AASX hochladen** und **JSON hochladen**: importieren vorhandene AAS aus
  Dateien, siehe [Import und Export](./import-export.md#aas-importieren).
- **Leere Verwaltungsschale**: legt eine AAS ohne Inhalte an und öffnet sie
  im Editor.
- **Assistenten verwenden**: führt Schritt für Schritt durch das Anlegen,
  siehe [AAS anlegen](./aas-anlegen.md).

**Hinzufügen** fehlt auf schreibgeschützten Infrastrukturen.

Existiert eine AAS in keinem Repository mehr, kann sie trotzdem gelöscht
werden. Dabei werden die zugehörigen Einträge aus den Registries und dem
Discovery-Service entfernt.

## Registry-Korrektur

Die Registry verweist mit einem Eintrag (Descriptor) je AAS und Teilmodell
auf die Adressen, unter denen sie abrufbar sind. Stimmen diese Adressen
nicht, z. B. nach einem Umzug der Infrastruktur, finden andere Systeme die
AAS nicht mehr. Die Seite **Registry-Korrektur** zeigt und korrigiert diese
Einträge.

![Seite Registry-Korrektur mit der Descriptor-Struktur links und dem Registry-Descriptor der AAS rechts](/img/designer/registry-korrektur.png)

1. In der Liste der Verwaltungsschalen im Zeilenmenü
   **Erweitert › Registry-Korrektur** wählen.
2. Links unter **Descriptor-Struktur** den Eintrag der AAS oder eines ihrer
   Teilmodelle wählen. Rechts stehen seine Angaben, z. B. **ID**,
   **idShort**, **Globale Asset-ID**, **Anzeigenamen**, **Administration**
   und **Endpunkte** mit **Schnittstelle**, **Endpoint-Protokoll** und
   **Endpoint-Adresse**.
3. **Bearbeiten** wählen.
4. Die Endpunkte anpassen oder mit **Weiteren Endpoint hinzufügen**
   ergänzen. Alternativ das **Rohe Descriptor-JSON** direkt bearbeiten;
   Änderungen an den Endpunkt-Feldern erscheinen sofort im JSON.
5. **Speichern**. Der Designer meldet „Der Registry-Descriptor wurde
   gespeichert.“

**Abbrechen** verwirft die Änderungen, **Aktualisieren** lädt die Einträge
neu und **Zurück** führt zur Liste.

:::warning
Die Änderung wirkt sofort in der Registry. Ein falscher Eintrag macht die
AAS oder das Teilmodell für andere Systeme unauffindbar.
:::

Die Registry-Korrektur fehlt auf schreibgeschützten Infrastrukturen.

## Teilmodelle und Konzeptbeschreibungen

**Teilmodelle** listet die Submodels der Infrastruktur, unabhängig davon, zu
welcher AAS sie gehören. Ein Klick auf eine Zeile öffnet das Teilmodell
direkt zum Bearbeiten, siehe [Editor](./editor.md#teilmodell-einzeln-bearbeiten).

![Liste der Teilmodelle](/img/designer/teilmodelle-liste.png)

- Das Feld **idShort** oben rechts sucht Teilmodelle nach ihrem idShort.
- Daneben wird die Infrastruktur gewählt.
- Die Spalte **Duplikate** zeigt, ob dieselbe ID mehrfach vorkommt.
  **1/1** heißt eindeutig; **2/3** heißt: zweiter von drei Einträgen mit
  derselben ID.

:::note Duplikate nur innerhalb der angezeigten Seite
Gezählt wird nur innerhalb der gerade geladenen Seite, also höchstens so
viele Einträge, wie unten als Seitengröße eingestellt sind. Liegt ein
zweiter Eintrag mit derselben ID auf einer anderen Seite, zeigt die Spalte
trotzdem **1/1**. Für eine vollständige Prüfung die Seitengröße erhöhen oder
über das Feld **idShort** gezielt filtern.
:::

**Konzeptbeschreibungen** listet die Concept Descriptions. Sie erklären, was
ein Element bedeutet, und werden über die Semantic ID eines Elements
gefunden. Wie sie bearbeitet werden, steht unter
[Konzeptbeschreibungen](./konzeptbeschreibungen.md).

![Liste der Konzeptbeschreibungen](/img/designer/konzeptbeschreibungen-liste.png)
