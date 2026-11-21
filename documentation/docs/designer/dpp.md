---
sidebar_position: 14
title: Digitaler Produktpass
description: Wie aus einer AAS im Designer ein digitaler Produktpass (DPP) wird, wie er veröffentlicht und seine Abrufbarkeit geprüft wird.
stichworte:
  DPP: ''
  Digitaler Produktpass: ''
  DPP-Metadaten: dpp-metadaten-anlegen
  DPP-Status: pass-veröffentlichen
  Öffentliche DPP-URL: pass-veröffentlichen
  DPP-Bereitschaft: bereitschaft-prüfen
  Granularität: dpp-metadaten-anlegen
  Wirtschaftsakteur-ID: dpp-metadaten-anlegen
quellen:
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/dpp-metadata/dpp-metadata.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/dpp-metadata/dpp-metadata.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/v3-shell/v3-shell.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/v3-editor.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor/v3-editor.component.ts
  - frontend/libs/aas-designer-core/src/lib/generator/save-and-confirm/save-and-confirm.component.html
  - frontend/libs/aas-designer-core/src/lib/generator/save-and-confirm/save-and-confirm.component.ts
  - frontend/libs/helpers/src/dpp-metadata-options.ts
  - services/aas-designer/AasDesignerAasApi/Controllers/DppMetadataController.cs
  - frontend/libs/translations/i18n/de.json
---

# Digitaler Produktpass (DPP)

Der digitale Produktpass (DPP) stellt Produktinformationen über eine
öffentliche Adresse bereit, z. B. für den Batteriepass nach der
EU-Batterieverordnung. Im Designer wird ein DPP aus einer vorhandenen AAS
erzeugt: Ein zusätzliches Teilmodell mit **DPP-Metadaten** legt fest, welche
Teilmodelle zum Pass gehören und in welchem Status er ist.

:::info Voraussetzung
Die DPP-Funktionen erscheinen nur, wenn für die aktuelle AAS-Infrastruktur
ein DPP-Dienst eingerichtet ist. Das richtet der Betrieb ein, siehe
[Konfiguration](../betrieb/konfiguration.md#öffentliche-dpp-url).
:::

## Inhalte vorbereiten

Ein Pass besteht aus den Teilmodellen der AAS. Am einfachsten entsteht eine
passende AAS mit dem [DPP-Assistenten oder dem Batteriepass-Assistenten](./assistenten.md).
Eine vorhandene AAS lässt sich ebenso verwenden; fehlende Teilmodelle werden
im [Editor](./editor.md#teilmodell-einfügen) aus den IDTA-Vorlagen ergänzt.

:::tip DPP-Metadaten schon im Assistenten
Der DPP-Assistent und der Batteriepass-Assistent fragen die DPP-Metadaten im
letzten Schritt ab, siehe
[DPP-Metadaten im Assistenten](./assistenten.md#dpp-metadaten-im-assistenten).
Die AAS hat dann beim ersten Öffnen im Editor bereits DPP-Metadaten, sofern
die Infrastruktur eine DPP-API hat. Ohne DPP-API speichert der Assistent nur
die AAS und weist darauf hin.
:::

## DPP-Metadaten anlegen

Ein Klick auf die AAS im Baum des Editors zeigt oben die Leiste **DPP** mit
dem aktuellen Stand:

| Anzeige | Bedeutung |
|---|---|
| Status wird geprüft… | Der Designer fragt den DPP-Dienst ab |
| Für diese AAS ist der DPP noch nicht konfiguriert. | Es gibt noch keine DPP-Metadaten |
| Für diese AAS ist der DPP konfiguriert. | DPP-Metadaten sind vorhanden |
| DPP-Status derzeit nicht verfügbar. | Der DPP-Dienst antwortet nicht oder mit einem Fehler |

Erkennt der Designer Teilmodelle des Batteriepasses in der AAS, zeigt die
Leiste zusätzlich deren Anzahl an.

1. Ungespeicherte Änderungen zuerst speichern. Solange es ungespeicherte
   Änderungen gibt, fehlt der Button **DPP-Metadaten anlegen**; auf
   schreibgeschützten Infrastrukturen fehlt er immer.
2. **DPP-Metadaten anlegen** wählen.
3. Die Angaben im Dialog ausfüllen und **Metadaten anlegen**. Der Button
   ist erst aktiv, wenn alle Pflichtfelder ausgefüllt sind.

![Dialog DPP-Metadaten anlegen](/img/designer/dpp-metadaten-anlegen.png)

| Feld | Bedeutung |
|---|---|
| DPP-ID | Kennung des Passes; entspricht der AAS-ID und ist nicht änderbar |
| Eindeutige Produktkennung | Kennung des Produkts, vorbelegt mit der globalen Asset-ID |
| Granularität | Gilt der Pass für ein **Einzelstück**, ein **Modell** oder eine **Charge** |
| DPP-Schemaversion | Version des Pass-Schemas, nach dem die Daten aufgebaut sind |
| DPP-Status | **Entwurf**, **Aktiv**, **Ausgesetzt** oder **Zurückgezogen** |
| Wirtschaftsakteur-ID | Kennung des verantwortlichen Unternehmens, z. B. eine Registrierungsnummer |
| Betriebsstätten-ID | Optional: Kennung des Herstellungsstandorts |
| DPP-Teilmodelle | Welche Teilmodelle der AAS zum Pass gehören. Teilmodelle ohne Semantic ID lassen sich nicht auswählen. |

Pflichtfelder sind mit `*` markiert. Die AAS selbst bleibt unverändert; es
kommt nur das Teilmodell mit den DPP-Metadaten hinzu.

Enthält die AAS keine Teilmodelle des Batteriepasses, weist der Dialog darauf
hin. Für andere Produktpässe kann dieser Hinweis ignoriert werden.

## Pass veröffentlichen

Neu angelegte Metadaten haben den Status **Entwurf**. Zum Veröffentlichen:

1. **DPP-Metadaten bearbeiten** wählen.
2. Den **DPP-Status** auf **Aktiv** setzen.
3. **Änderungen speichern**.

Sobald DPP-Metadaten vorhanden sind, zeigt die Leiste **DPP** die öffentliche
URL des Passes mit **Link kopieren**. Abrufbar ist der Pass dort aber nur im
Status **Aktiv**. Wird keine URL angezeigt, ist die öffentliche Adresse des
DPP-Dienstes nicht konfiguriert.

| Status | Bedeutung |
|---|---|
| Entwurf | In Bearbeitung, nicht öffentlich abrufbar |
| Aktiv | Veröffentlicht und über die öffentliche URL abrufbar |
| Ausgesetzt | Vorübergehend nicht abrufbar |
| Zurückgezogen | Dauerhaft zurückgenommen |

## Bereitschaft prüfen

Sind DPP-Metadaten vorhanden, bietet die Leiste **DPP** den Button
**DPP-Bereitschaft prüfen**. Er prüft, ob der Pass technisch über die API
abrufbar ist. Der Dialog **DPP-Bereitschaft** meldet als Ergebnis
„DPP über die API abrufbar“ oder „DPP derzeit nicht abrufbar“ und listet
gefundene Probleme als Fehler oder Warnung auf.

:::note
Die Prüfung bewertet nur die technische Abrufbarkeit, nicht die rechtliche
Konformität des Passes.
:::

## Hinweise

- Ein unterbrochener Anlegeversuch kann wiederholt werden. Existiert das
  Metadaten-Teilmodell bereits, während der DPP-Dienst noch keinen Pass
  findet, aktualisiert der Editor nur DPP-Metadaten, die eindeutig dieser AAS
  zugeordnet sind, und ergänzt eine fehlende Referenz. Zusätzliche
  Metadatenfelder bleiben erhalten; fremde Teilmodelle werden nicht
  überschrieben und vorhandene Referenzen nicht doppelt angelegt.
- Beim Erzeugen der Metadaten werden die Einträge in
  `contentSpecificationIds` ohne `idShort` geschrieben, wie für eine
  `SubmodelElementList` vorgeschrieben. Auch mehrere ausgewählte
  Content-Spezifikationen erzeugen damit keine doppelten `idShort`-Werte.
