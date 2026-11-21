---
sidebar_position: 12
title: IDTA-Vorlagen
description: Zeigt, wie die Teilmodell-Vorlagen der IDTA im Designer nachgeschlagen und als Teilmodell in eine AAS eingefügt werden.
stichworte:
  IDTA: ''
  IDTA Submodels: vorlagen-nachschlagen
  Submodel Template: vorlagen-nachschlagen
  Teilmodell-Vorlage: vorlage-als-teilmodell-einfügen
  IDTA (live aus dem Repository): vorlage-als-teilmodell-einfügen
quellen:
  - frontend/libs/aas-designer-core/src/lib/idta-submodels/idta-submodels.component.html
  - frontend/libs/aas-designer-core/src/lib/idta-submodels/idta-submodels.component.ts
  - frontend/libs/aas-designer-core/src/lib/idta-submodels/idta.service.ts
  - frontend/libs/designer-app-menu/src/lib/app-menu/app.menu.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/dialogs/insert-submodel/v3-insert-submodel-dialog.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/dialogs/insert-submodel/v3-insert-submodel-dialog.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-tree-context-menu/v3-insert-options.ts
  - services/aas-designer/AasDesignerApi/SubmodelTemplate/SubmodelTemplateService.cs
  - frontend/libs/translations/i18n/de.json
---

# IDTA-Vorlagen

Die Industrial Digital Twin Association (IDTA) veröffentlicht standardisierte
Teilmodelle, z. B. Digital Nameplate, Technical Data oder Carbon Footprint.
Der Designer nutzt diese Vorlagen an zwei Stellen.

## Vorlagen nachschlagen

**IDTA Submodels** im Hauptmenü zeigt das offizielle GitHub-Repository der
IDTA als Baum: Teilmodell, Version und die zugehörigen Dateien. **Aufklappen**
und **Zuklappen** öffnen bzw. schließen alle Ebenen. Ein Klick auf eine Datei
zeigt sie an: die Vorlage als JSON, die Spezifikation als PDF oder die README
als formatierten Text. Andere Dateitypen werden nicht angezeigt.

![IDTA Submodels mit geöffneter Vorlage](/img/designer/idta-submodels.png)

Die Ansicht ist ein 1:1-Abbild des offiziellen Repositorys. Die AAS Suite hat
keinen Einfluss auf Vollständigkeit oder Verfügbarkeit der Inhalte.

## Vorlage als Teilmodell einfügen

Im [Editor](./editor.md#teilmodell-einfügen) lädt der Dialog
**Teilmodell einfügen** unter **IDTA (live aus dem Repository)** die Vorlagen
direkt aus dem Repository. Eine eingefügte Vorlage enthält alle Elemente mit
ihren semantischen IDs; die Werte werden anschließend ausgefüllt.

1. Im Baum des Editors das Menü (⋮) der AAS öffnen.
2. **Hinzufügen › Teilmodelle** wählen.
3. Die Gruppe **IDTA (live aus dem Repository)** aufklappen. Beim ersten
   Aufklappen lädt der Designer die Liste der Vorlagen.
4. Über **Durchsuchen** die Vorlage suchen, z. B. `TechnicalData`. Neben
   dem Namen steht in Klammern die AAS des Repositorys, aus der die Vorlage
   stammt, daneben die Version.
5. **Übernehmen** fügt die Vorlage als neues Teilmodell ein.
6. Werte ausfüllen und die AAS **Speichern**.

Beispielwerte der Vorlage werden dabei nicht als Werte übernommen, siehe
[Editor](./editor.md#teilmodell-einfügen).

:::info Zwischenspeicher
Die Liste der Vorlagen wird bis zu 15 Minuten zwischengespeichert. Ist das
Repository der IDTA nicht erreichbar, verwendet der Designer die zuletzt
geladene Liste. Neue Vorlagen der IDTA erscheinen deshalb mit kurzer
Verzögerung.
:::

Neben den Live-Vorlagen gibt es im selben Dialog die Gruppe **Integrierte
Vorlagen**, die mit dem Designer ausgeliefert werden.
