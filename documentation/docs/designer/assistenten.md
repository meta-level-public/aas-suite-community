---
sidebar_position: 13
title: Assistenten
description: Die spezialisierten Assistenten für Batteriepass und digitalen Produktpass, ihre Schritte und die DPP-Metadaten im letzten Schritt.
stichworte:
  Assistenten: ''
  Batteriepass: batteriepass-assistent
  BatteryPassportAssistent: batteriepass-assistent
  DPP Assistant: dpp-assistent
  Produkt-CO2-Fußabdruck: dpp-assistent
  DPP-Metadaten: dpp-metadaten-im-assistenten
quellen:
  - frontend/libs/aas-designer-core/src/lib/generator/select-type/select-type.component.html
  - frontend/libs/aas-designer-core/src/lib/generator/generator-flow.config.ts
  - frontend/libs/aas-designer-core/src/lib/generator/generator-mode.config.ts
  - frontend/libs/aas-designer-core/src/lib/generator/battery-passport-template-registry.ts
  - frontend/libs/aas-designer-core/src/lib/generator/save-and-confirm/save-and-confirm.component.html
  - frontend/libs/aas-designer-core/src/lib/generator/save-and-confirm/save-and-confirm.component.ts
  - frontend/libs/battery-passport-assistant/src/lib/battery-passport-assistant/battery-passport-assistant.html
  - frontend/libs/battery-passport-assistant/src/lib/battery-passport-assistant/battery-passport-assistant.service.ts
  - frontend/libs/battery-passport-assistant/src/lib/dpp-core-assistant/dpp-core-assistant.html
  - frontend/libs/translations/i18n/de.json
---

# Spezialisierte Assistenten

Für einige Anwendungsfälle gibt es eigene Assistenten im
[geführten Modus](./aas-anlegen.md). Sie stehen dort unter
**Spezialisierte Assistenten** und werden mit **Auswählen** gestartet. Sie
laden automatisch die nötigen IDTA-Teilmodelle und fragen deren Inhalte
Schritt für Schritt ab. Der Ablauf entspricht dem Anlegen einer
Instanzverwaltungsschale: Assetdaten erfassen, Schritte ausfüllen,
Zusammenfassung prüfen, speichern. Beide Assistenten legen eine
Instanzverwaltungsschale an.

## Batteriepass-Assistent

Der **BatteryPassportAssistent** erzeugt eine AAS für den digitalen
Batteriepass. Er lädt die Vorlagen des Batteriepasses aus dem
IDTA-Vorlagenverzeichnis. Neben Digital Nameplate und Technical Data enthält
er alle Teilmodelle des Batteriepasses, z. B.:

1. Assetdaten erfassen
2. Digitales Typenschild
3. Technische Daten
4. Übergabedokumentation
5. Produkt-CO2-Fußabdruck
6. Zirkularität
7. Materialzusammensetzung
8. Produktzustand
9. Zusammenfassung

:::note Schritte aus der Vorlage
Welche Schritte erscheinen, hängt von den geladenen Vorlagen ab. Für jedes
Teilmodell der Vorlage gibt es einen eigenen Schritt; fehlt ein Teilmodell,
fehlt auch sein Schritt. Die Schritte nach dem Produkt-CO2-Fußabdruck folgen
der Reihenfolge der Vorlage.
:::

![Batteriepass-Assistent](/img/designer/assistent-batteriepass.png)

## DPP-Assistent

Der **DPP Assistant** bereitet einen digitalen Produktpass vor. Er verwendet
Assetdaten, Digital Nameplate und Handover Documentation und ergänzt die
Angaben für den Product Carbon Footprint:

1. Assetdaten erfassen
2. Digitales Typenschild
3. Übergabedokumentation
4. Produkt-CO2-Fußabdruck
5. Zusammenfassung

![DPP-Assistent](/img/designer/assistent-dpp.png)

## DPP-Metadaten im Assistenten

In beiden Assistenten enthält die **Zusammenfassung** zusätzlich den Bereich
**DPP-Metadaten**. Er legt beim Speichern gleich den Produktpass zur neuen
AAS an.

1. Die Felder prüfen. Vorbelegt sind die **DPP-ID** (die AAS-ID, nicht
   änderbar), die **Eindeutige Produktkennung** (die globale Asset-ID), die
   **Granularität** **Einzelstück**, die **DPP-Schemaversion**
   `EN 18223:2026` und der **DPP-Status** **Entwurf**.
2. Die **Wirtschaftsakteur-ID** eintragen. Die **Betriebsstätten-ID** ist
   optional.
3. Unter **DPP-Teilmodelle** festlegen, welche Teilmodelle zum Pass gehören.
   Teilmodelle ohne Semantic ID lassen sich nicht auswählen.
4. **Speichern**.

Solange eine der Pflichtangaben **Eindeutige Produktkennung**,
**DPP-Schemaversion** oder **Wirtschaftsakteur-ID** leer ist, ist
**Speichern** gesperrt. Die Felder haben dieselbe Bedeutung wie im Dialog
[DPP-Metadaten anlegen](./dpp.md#dpp-metadaten-anlegen).

DPP-Metadaten lassen sich nur auf einer Infrastruktur mit DPP-Schnittstelle
(DPP-API) anlegen, siehe [AAS-Infrastruktur](./organisation.md#aas-infrastruktur).
Fehlt sie, zeigt der Bereich **DPP-Metadaten** einen Hinweis. Der Assistent
bleibt nutzbar: **Speichern** legt die AAS an, aber keine DPP-Metadaten, und
meldet das. Dasselbe gilt, wenn die DPP-API beim Speichern einen Fehler
liefert. Die Metadaten lassen sich später im Editor nachholen, siehe
[DPP-Metadaten anlegen](./dpp.md#dpp-metadaten-anlegen).

Wie der fertige Pass veröffentlicht wird, steht unter
[Digitaler Produktpass](./dpp.md#pass-veröffentlichen).
