---
sidebar_position: 8.5
title: Assistenten im Editor
description: Die Assistenten, die der Editor für bestimmte IDTA-Teilmodelle anbietet – Schnittstellen, Fähigkeiten, CO2-Fußabdruck, Dokumente, Kontaktdaten und Stückliste.
stichworte:
  Assistenten im Editor: ''
  Aus Erweiterung: überblick
  Mit Assistent bearbeiten: überblick
  Asset Interfaces Description: asset-interfaces-description
  Interface hinzufügen: asset-interfaces-description
  Capability Description: capability-description
  Capability hinzufügen: capability-description
  Carbon Footprint: carbon-footprint
  PCF-Eintrag: carbon-footprint
  Handover Documentation: handover-documentation
  Dokument hinzufügen: handover-documentation
  ContactInformation: kontaktinformationen
  Kontaktinformationen erfassen: kontaktinformationen
  Stückliste: stückliste
  BOM erstellen: stückliste
  Archetyp: stückliste
  BOM neu initialisieren: stückliste
quellen:
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/v3-editor.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/v3-editor-capability.service.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/v3-editor-pcf.service.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/addon-resolver.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/v3-addon-editor.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/v3-capability-addon-helpers.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/v3-context-menu-model.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/v3-context-menu-permissions.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/addons/asset-interfaces-interface-addon/asset-interfaces-interface-addon.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/addons/asset-interfaces-interface-addon/asset-interfaces-interface-addon.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/addons/capability-addon/capability-addon.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/addons/capability-addon/capability-addon.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/addons/pcf-entry-addon/pcf-entry-addon.component.ts
  - frontend/libs/aas-designer-core/src/lib/general/pcf-entry-assistant/pcf-entry-assistant.component.html
  - frontend/libs/aas-designer-core/src/lib/general/pcf-entry-assistant/pcf-entry-assistant.component.ts
  - frontend/libs/battery-passport-assistant/src/lib/dpp-core-assistant/dpp-assistant.service.ts
  - frontend/libs/battery-passport-assistant/src/lib/battery-passport-assistant/battery-passport-assistant.service.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/addons/handoverdocumentation-document-addon/handoverdocumentation-document-addon.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/addons/handoverdocumentation-document-addon/handoverdocumentation-document-addon.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/contact-information-addon/contact-information-addon.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/contact-information-addon/contact-information-addon.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/contact-information-addon/contact-information-template.json
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/v3-submodel-editor/v3-submodel-editor.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/v3-submodel-editor/v3-submodel-editor.component.ts
  - frontend/libs/aas-viewer-standalone/src/lib/submodel-specialized-viewer/submodel-specialized-viewer.component.html
  - frontend/libs/aas-viewer-standalone/src/lib/submodel-specialized-viewer/submodel-specialized-viewer.component.ts
  - frontend/libs/aas-viewer-standalone/src/lib/specific-submodels/bom-viewer/bom-viewer.component.html
  - frontend/libs/bom-diagram/src/lib/bom-chart-mermaid/bom-chart-mermaid.component.html
  - frontend/libs/bom-diagram/src/lib/bom-chart-mermaid/bom-chart-mermaid.component.ts
  - frontend/libs/bom-diagram/src/lib/bom-chart-mermaid/init-bom-assistant/init-bom-assistant.component.html
  - frontend/libs/bom-diagram/src/lib/bom-chart-mermaid/init-bom-assistant/init-bom-assistant.component.ts
  - frontend/libs/bom-diagram/src/lib/bom-chart-mermaid/init-bom-assistant/select-type/select-type.component.ts
  - frontend/libs/translations/i18n/de.json
---

# Assistenten im Editor

Für einige IDTA-Teilmodelle bietet der [Editor](./editor.md) Assistenten an.
Sie fragen die Inhalte in einem Formular ab und erzeugen daraus die
Elemente mit den richtigen Semantic IDs, sodass der Elementbaum nicht von
Hand aufgebaut werden muss. Welcher Assistent erscheint, hängt von der
Semantic ID des gewählten Eintrags ab.

## Überblick

Die Assistenten erscheinen an zwei Stellen:

- **Über der Ansicht** des im Baum gewählten Eintrags, neben **Ansicht** und
  **Bearbeiten**: **Interface hinzufügen**, **Capability hinzufügen**,
  **Eintrag hinzufügen** und **Mit Assistent bearbeiten**.
- **Im Menü (⋮) des Eintrags** unter **Hinzufügen › Aus Erweiterung**:
  **Dokument**, **ContactInformation** und **Capability**. Passt kein
  Assistent zum Eintrag, steht dort **Keine Elemente verfügbar**.

| Teilmodell | Eintrag im Baum | Assistent |
|---|---|---|
| Asset Interfaces Description | Teilmodell bzw. ein Interface | **Interface hinzufügen**, **Mit Assistent bearbeiten**, **Interface löschen** |
| Capability Description | Teilmodell, CapabilitySet bzw. CapabilityContainer | **Capability hinzufügen**, **Mit Assistent bearbeiten**, **Aus Erweiterung › Capability** |
| Carbon Footprint 1.0 | Liste der Footprints bzw. ein Eintrag darin | **Eintrag hinzufügen**, **Mit Assistent bearbeiten** |
| Handover Documentation 1.2 und 2.0 | Teilmodell | **Aus Erweiterung › Dokument** |
| Digital Nameplate (Kontaktdaten) | Collection AddressInformation | **Aus Erweiterung › ContactInformation** |
| Hierarchical Structures 1.0 und 1.1 (Stückliste) | Teilmodell | Assistent **BOM erstellen** und bearbeitbares Hierarchiediagramm |

Alle Assistenten ändern nur die AAS im Editor. **Übernehmen** schließt den
Dialog und fügt das Ergebnis in den Baum ein; gespeichert wird erst mit der
Diskette, siehe [Speichern](./editor.md#speichern-und-änderungsprotokoll).
**Abbrechen** verwirft die Eingaben im Dialog.

:::note Erkennung über die Semantic ID
Die Assistenten erscheinen nur, wenn der Eintrag die Semantic ID der
jeweiligen Vorlage trägt. Teilmodelle, die über **Hinzufügen › Teilmodelle**
aus der IDTA-Vorlage angelegt wurden, haben sie bereits. Fehlt die Semantic
ID oder stammt sie aus einer anderen Version der Vorlage, fehlen auch die
Buttons.
:::

## Asset Interfaces Description

Der Assistent beschreibt eine Schnittstelle des Asset, z. B. eine
HTTP-Schnittstelle oder ein MQTT-Topic, nach dem Teilmodell Asset Interfaces
Description.

### Interface anlegen

1. Im Baum das Teilmodell Asset Interfaces Description wählen.
2. **Interface hinzufügen** öffnet den Dialog.
3. **Interface idShort** prüfen (vorbelegt mit `Interface00`, `Interface01`
   usw.), **Titel** und **Interaction-Typ** (Property, Action oder Event)
   festlegen und unter **Endpoint Base URI** die Basisadresse eintragen.
4. Unter **Security Definitions** bei Bedarf mit
   **Security-Scheme hinzufügen** Sicherheitsverfahren ergänzen.
5. Unter **Properties** mit **Property hinzufügen** die Datenpunkte
   anlegen: **Property idShort**, **Property Key**, **Property Titel**,
   **Property Datentyp**, **Property UnitCode**, **Property IsObservable**
   und **Property ValueSemantics**. **Nested Property hinzufügen** legt
   untergeordnete Datenpunkte an.
6. Unter **Forms** festlegen, wie die Schnittstelle erreicht wird. Ein Form
   ist schon angelegt; **Form hinzufügen** ergänzt weitere. Je Form
   **Protokoll** (HTTP, MQTT, Modbus oder Other), **Target** und
   **Content Type** angeben, dazu je nach Protokoll z. B. **HTTP-Methode**
   und **HTTP-Header**, **MQTT QoS** oder **Modbus Funktion**.
7. **Übernehmen**.

Beim Wechsel des Protokolls füllt der Assistent leere Felder vor, z. B. für
HTTP den Content Type `application/json`, das Target `/` und die Methode
`GET`.

Solange Angaben fehlen, ist **Übernehmen** gesperrt und oben im Dialog steht
unter **Validierungsfehler**, was fehlt:

- Die **Interface idShort** ist leer.
- Es gibt kein Form.
- Ein Form hat kein **Target**.
- Bei Protokoll Other fehlt der **Protokollwert**.

### Interface bearbeiten oder löschen

Ist im Baum ein Interface gewählt, öffnet **Mit Assistent bearbeiten**
denselben Dialog mit den vorhandenen Angaben. **Interface löschen** entfernt
das Interface nach der Rückfrage „Soll dieses Interface wirklich gelöscht
werden?“.

Wie die Schnittstellen im Viewer erscheinen, steht unter
[Viewer › Asset Interfaces Description](./viewer.md#asset-interfaces-description).

## Capability Description

Der Assistent legt eine Fähigkeit (Capability) mit ihren Eigenschaften,
Bedingungen und Beziehungen nach dem Teilmodell Capability Description an.

1. Im Baum das CapabilitySet wählen und **Capability hinzufügen** klicken.
   Alternativ am Teilmodell oder am CapabilitySet im Menü
   **Hinzufügen › Aus Erweiterung › Capability** wählen; fehlt dem Teilmodell
   noch ein CapabilitySet, legt der Designer es dabei an.
2. **Capability idShort** und **Capability-Rolle** (Required, Offered oder
   NotAssigned) festlegen, optional **Capability-Kommentar** und
   **Supplemental Semantic IDs**.
3. Unter **Properties** mit **Property-Container hinzufügen** und
   **Property Variable hinzufügen** die Eigenschaften anlegen. Eine
   Eigenschaft ist eine Property, ein Bereich (Range), eine
   MultiLanguageProperty oder eine Liste.
4. Unter **Capability realisiert durch** und
   **Capability generalisiert durch** Beziehungen zu anderen Capabilities
   angeben. Die Auswahl einer vorhandenen Capability erzeugt eine interne
   ModelReference, Freitext eine externe Reference.
5. Unter **Constraint Set** mit **Property-Constraint hinzufügen** und
   **Transition-Constraint hinzufügen** Bedingungen ergänzen.
6. **Übernehmen**.

Der Assistent prüft beim Ausfüllen und sperrt **Übernehmen**, solange
z. B. die Capability idShort fehlt, eine Property kein idShort hat, ein
Property-Constraint keinen Wert oder keine Ziel-Property hat oder ein
Transition-Constraint keine Ziel-Capability.

Ist ein CapabilityContainer gewählt, öffnet **Mit Assistent bearbeiten**
die vorhandene Capability im selben Dialog.

## Carbon Footprint

Für das Teilmodell Carbon Footprint 1.0 erfasst der Assistent einzelne
Einträge zum CO2-Fußabdruck des Produkts.

1. Im Baum die Liste ProductCarbonFootprints oder
   ProductOrSectorSpecificCarbonFootprints wählen.
2. **Eintrag hinzufügen** öffnet den Assistenten.
3. Die Felder Gruppe für Gruppe ausfüllen und mit **Weiter** zur nächsten
   Gruppe wechseln; **Zurück** geht eine Gruppe zurück.
4. In der letzten Gruppe fügt **Weiter** den Eintrag am Ende der Liste ein.

| Liste | Gruppen |
|---|---|
| ProductCarbonFootprints | **Methoden & Lebenszyklusphasen**, **Deklaration & Bezugsbasis** (u. a. **PCF CO2eq**, **Referenz-Impact-Unit**, **Mengenbezug für Berechnung**), **Nachweis & Gültigkeit** |
| ProductOrSectorSpecificCarbonFootprints | **Berechnungsmethoden**, **Regelwerk**, **Externe PCF-API**, **Zusätzliche PCF-Informationen** |

Ist ein Eintrag der Liste gewählt, öffnet **Mit Assistent bearbeiten** ihn
mit den vorhandenen Werten.

:::info Vorlage aus dem IDTA-Verzeichnis
Der Assistent lädt beim Öffnen die Vorlage Carbon Footprint aus dem
[IDTA-Vorlagenverzeichnis](./idta-vorlagen.md). Ist es nicht erreichbar,
meldet der Designer „Beim Laden der Daten ist ein Fehler aufgetreten.“ und
schließt den Assistenten.
:::

Dieselben Gruppen fragt auch der
[DPP-Assistent](./assistenten.md#dpp-assistent) beim Anlegen einer AAS ab.

## Handover Documentation

Der Assistent fügt der Handover Documentation ein Dokument mit Datei und
Metadaten hinzu.

1. Im Baum das Teilmodell Handover Documentation wählen.
2. Im Menü (⋮) **Hinzufügen › Aus Erweiterung › Dokument** wählen. Der
   Dialog **Dokument hinzufügen** öffnet sich.
3. Mit **Datei wählen** oder per Drag & Drop die Datei laden.
4. Unter **Dokumentversion** **Sprache**, **Version**, **Dokumenttitel**,
   **Untertitel** und **Beschreibung** angeben.
5. Unter **Dokument ID** **ValueId** und **Domain ID** eintragen.
6. Unter **Dokumentklassifizierung** **Klassifizierungssystem**,
   **Klassenname** und **Klasse ID** angeben.
7. **Übernehmen**.

**Übernehmen** ist erst möglich, wenn alle mit * markierten Pflichtfelder
ausgefüllt sind: Datei, Sprache, Dokumenttitel, ValueId, Domain ID,
Klassifizierungssystem, Klassenname und Klasse ID.

Das Dokument landet in Version 2.0 in der Liste der Dokumente, in Version
1.2 direkt im Teilmodell; dort erhöht der Designer auch die Anzahl der
Dokumente. Die Datei kommt zu den **SupplementalFiles** der AAS und wird beim
Speichern hochgeladen.

## Kontaktinformationen

Der Assistent füllt die Kontaktdaten im Digital Nameplate.

1. Im Baum die Collection AddressInformation des Digital Nameplate wählen.
2. Im Menü (⋮) **Hinzufügen › Aus Erweiterung › ContactInformation**
   wählen. Der Dialog **Kontaktinformationen erfassen** öffnet sich.
3. **Firmenname**, Anschrift (**Straßenadresse**, **Postleitzahl**,
   **Stadt/Ort**, **Ländercode**) und Kontaktdaten (**Telefonnummer**,
   **E-Mail-Adresse**) eintragen.
4. **Übernehmen**.

Der Assistent fügt die Elemente Company, Street, Zipcode, CityTown,
NationalCode, Phone und Email unter der gewählten Collection ein. Vorhandene
Elemente bleiben dabei stehen; am besten den Assistenten daher an einer noch
leeren Collection verwenden.

## Stückliste

Eine Stückliste nach Hierarchical Structures (BOM) wird im Editor als
Hierarchiediagramm bearbeitet. Es erscheint in der **Ansicht** des
Teilmodells und unter **Bearbeiten** im Abschnitt **Stückliste**.

### Stückliste anlegen

Solange die Stückliste keinen Einstiegsknoten hat, meldet die **Ansicht**
„Kein Einstiegsknoten gefunden.“ Angelegt wird sie unter **Bearbeiten**:

1. Im Baum das Teilmodell Hierarchical Structures wählen und oben rechts
   **Bearbeiten** klicken.
2. Im Abschnitt **Stückliste** öffnet **Initialisieren** den Assistenten
   **BOM erstellen**.
3. **Typ auswählen**: einen Archetyp wählen und **Weiter**.
   - **Archetyp Full**: die ganze Hierarchie über mehrere Ebenen.
   - **Archetyp One Down**: nur die Ebene direkt unterhalb des Asset.
   - **Archetyp One Up**: nur das unmittelbare Elternelement.
4. **Startknoten definieren**: den Einstiegsknoten für das Asset dieser AAS
   beschreiben, mindestens mit idShort, und **Weiter**.
5. **Ersten Kindknoten definieren**: den ersten Bestandteil (bei One Up das
   Elternelement) beschreiben und **Fertigstellen**.

Bei einem Kindknoten vom Typ SelfManagedEntity muss entweder die globale
Asset-ID oder mindestens eine Specific Asset ID gesetzt sein, aber nicht
beides. Bei Full und One Down verbindet der Designer die Knoten mit HasPart,
bei One Up mit IsPartOf.

### Im Diagramm arbeiten

Ein Klick auf einen Knoten zeigt seine Aktionen:

- **Details** zeigt die Angaben des Knotens.
- **Verknüpfte AAS** öffnet die AAS des Bestandteils, sofern der Knoten auf
  ein Asset verweist.
- **Kindknoten einfügen** legt einen Bestandteil unter dem Knoten an.
- **Element entfernen** löscht den Knoten.

Zum Umhängen eines Knotens das Symbol am gewählten Knoten greifen und den
Knoten auf den neuen Elternknoten ziehen.

Über dem Diagramm stehen **Diagramm aktualisieren**,
**Ausrichtung wechseln**, **Farbschema wechseln**, **BOM neu initialisieren**
und **Diagramm herunterladen** (SVG). Am Rand des Diagramms vergrößern und
verkleinern Lupen die Darstellung, **Alle Knoten zeigen** passt sie ein und
**Diagramm im ganzen Fenster zeigen** maximiert sie.

:::warning BOM neu initialisieren
**BOM neu initialisieren** ersetzt nach der Rückfrage „Die bestehende
Einstiegsknoten-Struktur wird ersetzt. Möchten Sie fortfahren?“ den
Einstiegsknoten mit allen Knoten darunter und startet den Assistenten
**BOM erstellen** neu. Findet der Designer nur einen Einstiegsknoten ohne
Kindknoten, schlägt er das unter **Unvollständige BOM erkannt** selbst vor.
:::

Fehlen der AAS die Asset-Informationen oder die idShort, zeigt die Ansicht
statt des Diagramms eine Warnung mit dem Grund.

Weitere Assistenten in eigenen Kapiteln: der
[PCN-Bereich](./pcn.md) für Änderungsmitteilungen und die
[spezialisierten Assistenten](./assistenten.md) für Batteriepass und
digitalen Produktpass.
