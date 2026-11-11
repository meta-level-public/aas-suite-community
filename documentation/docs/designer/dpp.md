---
sidebar_position: 14
title: Digitaler Produktpass
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

## DPP-Metadaten anlegen

Ein Klick auf die AAS im Baum des Editors zeigt oben die Leiste **DPP** mit
dem aktuellen Stand, z. B. „Für diese AAS ist der DPP noch nicht
konfiguriert.“

1. Ungespeicherte Änderungen zuerst speichern; vorher ist der Button
   gesperrt.
2. **DPP-Metadaten anlegen** wählen.
3. Die Angaben im Dialog ausfüllen und **Metadaten anlegen**.

![Dialog DPP-Metadaten anlegen](/img/designer/dpp-metadaten-anlegen.png)

| Feld | Bedeutung |
|---|---|
| DPP-ID | Kennung des Passes; entspricht der AAS-ID und ist nicht änderbar |
| Eindeutige Produktkennung | Kennung des Produkts, vorbelegt mit der Asset-ID |
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

Neu angelegte Metadaten haben den Status **Entwurf**. Zum Veröffentlichen
**DPP-Metadaten bearbeiten** wählen und den **DPP-Status** auf **Aktiv**
setzen.

Die öffentliche Adresse liefert nur Pässe im Status **Aktiv**. Die Leiste
**DPP** zeigt dann die öffentliche URL mit **Link kopieren**. Wird keine URL
angezeigt, ist die öffentliche Adresse des DPP-Dienstes nicht konfiguriert.

| Status | Bedeutung |
|---|---|
| Entwurf | In Bearbeitung, nicht öffentlich abrufbar |
| Aktiv | Veröffentlicht und über die öffentliche URL abrufbar |
| Ausgesetzt | Vorübergehend nicht abrufbar |
| Zurückgezogen | Dauerhaft zurückgenommen |

## Bereitschaft prüfen

**DPP-Bereitschaft prüfen** prüft, ob der Pass technisch über die API
abrufbar ist, und listet gefundene Probleme auf. Die Prüfung bewertet nur die
technische Abrufbarkeit, nicht die rechtliche Konformität des Passes.

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
