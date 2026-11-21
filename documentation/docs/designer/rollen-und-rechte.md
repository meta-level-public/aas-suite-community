---
sidebar_position: 20
title: Rollen und Rechte
description: Welche Rollen es im Designer gibt, wie Infrastruktur-Rechte wirken und welche Kombination für welche Aufgabe nötig ist.
stichworte:
  Rolle: rollen
  Berechtigung: ''
  Infrastruktur-Rechte: infrastruktur-rechte
  Leserecht: infrastruktur-rechte
  Schreibrecht: infrastruktur-rechte
  Marktplatz veröffentlichen: infrastruktur-rechte
  Standardrechte: rechte-bei-neuen-infrastrukturen-und-mitgliedern
quellen:
  - frontend/libs/aas-designer-model/src/lib/auth-roles.ts
  - frontend/libs/designer-app-menu/src/lib/app-menu/app.menu.component.ts
  - frontend/libs/designer-app-topbar/src/lib/app-topbar/app-topbar.component.ts
  - frontend/libs/aas-designer-core/src/lib/organisation/organisation-user/organisation-user-list/organisation-user.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/organisation-user/organisation-user-list/organisation-user.component.ts
  - frontend/libs/aas-designer-core/src/lib/organisation/infrastruktur-rechte/infrastruktur-rechte.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/infrastruktur-rechte/infrastruktur-rechte.component.ts
  - frontend/apps/aas-designer-community/src/app/app.routes.ts
  - frontend/apps/aas-designer-enterprise/src/app/app.config.ts
  - frontend/libs/aas-designer-core/src/lib/organisation/role-label/role-label.pipe.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/v3-editor.routes.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/editor-start/editor-start.component.ts
  - frontend/libs/translations/i18n/de.json
  - services/aas-designer/AasDesignerModel/Model/AuthRoles.cs
  - services/aas-designer/AasDesignerApi/Orga/OrganisationService.cs
  - services/aas-designer/AasDesignerApi/Authorization/UserService.cs
  - services/aas-designer/AasDesignerCommon/Utils/InfrastrukturRechteUtil.cs
  - services/aas-designer/AasDesignerAasApi/Infrastructure/Queries/GetAvailableInfrastructures/GetAvailableInfastructuresQuery.cs
  - frontend/libs/common-services/src/lib/portal.service.ts
---

# Rollen und Rechte

Was ein Benutzer im Designer sehen und tun darf, ergibt sich aus zwei Dingen:

- den **Rollen** in der Organisation, die unter
  [Organisation › Benutzer](./organisation.md#benutzer) vergeben werden, und
- den **Infrastruktur-Rechten**, die je AAS-Infrastruktur festlegen, ob jemand
  lesen, schreiben oder im Markt veröffentlichen darf.

Rollen gelten je Organisation. Wer Mitglied in mehreren Organisationen ist,
kann dort unterschiedliche Rollen haben; die eigenen Rollen zeigt
[Mein Bereich › Organisationen](./mein-bereich.md#organisationen).

## Rollen

Im Dialog **Rollen bearbeiten** steht unter jeder Rolle eine kurze
Beschreibung. In Klammern steht hier jeweils der technische Name, unter dem
die Rolle z. B. in Zugriffstoken und Protokollen erscheint.

| Rolle | Bedeutung |
|---|---|
| **Benutzer** (`BENUTZER`) | Grundzugang zur Organisation: Liste der Verwaltungsschalen, Teilmodelle und Konzeptbeschreibungen, Viewer, IDTA-Vorlagen, Plugins und Mein Bereich |
| **Organisationsadministration** (`ORGA_ADMIN`) | Verwaltet die Organisation: Benutzer, Einladungen, Rollen, Infrastrukturen, Token und ECLASS-Zertifikat. Zeigt den Menüpunkt **Organisation**. |
| **Feed-Mapping** (`FEED_MAPPING_USER`) | Zugriff auf das Feed-Mapping |
| **Hilfe-Redaktion Organisation** (`ORGA_HELP_EDITOR`) | Darf die Hilfetexte der Organisation bearbeiten, siehe [Feldhilfen](./feldhilfen.md) |
| **Systemadministration** (`SYSTEM_ADMIN`) | Systemweite Administration aller Organisationen. Zeigt den Menüpunkt **Systemverwaltung**. |
| **Hilfe-Redaktion System** (`SYSTEM_HELP_EDITOR`) | Darf systemweite Hilfetexte bearbeiten |

**Systemadministration** und **Hilfe-Redaktion System** sieht und vergibt
nur, wer selbst die Rolle **Systemadministration** hat. Die eigene Rolle
**Organisationsadministration** lässt sich nicht entfernen,
damit eine Organisation nicht ohne Administration bleibt.

Mit **Hilfe-Redaktion Organisation** oder **Hilfe-Redaktion System** steht im
Benutzermenü der Eintrag **Hilfebearbeitung aktivieren**.

:::info Enterprise
Das Feed-Mapping gibt es nur in der Enterprise-Edition. Die Rolle
**Feed-Mapping** lässt sich auch in der Community-Edition vergeben, hat
dort aber keine Wirkung. In der Enterprise-Edition zeigt sie den Menüpunkt
**Feed Mapping**, sofern die Lizenz das Feed-Mapping enthält und die aktuelle
Infrastruktur beschreibbar ist.
:::

## Infrastruktur-Rechte

Die Rechte auf eine AAS-Infrastruktur werden pro Benutzer gesetzt, entweder
unter **Organisation › Benutzer** › ⋮ › **Infrastruktur-Zugriffsrechte** oder
auf der Detailseite der Infrastruktur. Beide Ansichten zeigen eine Tabelle mit
Kästchen; **Speichern** übernimmt die Änderungen.

| Recht | Erlaubt |
|---|---|
| Lesen | AAS, Teilmodelle und Konzeptbeschreibungen der Infrastruktur ansehen und exportieren |
| Schreiben | Inhalte anlegen, ändern und löschen; schließt Lesen ein |
| Marktplatz veröffentlichen | AAS der Infrastruktur im Markt anbieten |

Wird **Schreiben** angekreuzt, setzt der Designer **Lesen** automatisch mit;
solange **Schreiben** gesetzt ist, lässt sich **Lesen** nicht abwählen.

Die Rechte gelten für alle Benutzer gleich, auch für die Administration der
Organisation:

- Ohne Leserecht erscheint eine Infrastruktur nicht in der Auswahl der Liste
  der Verwaltungsschalen. Deaktivierte Infrastrukturen erscheinen dort
  ebenfalls nicht.
- Ohne Schreibrecht behandelt der Designer die Infrastruktur für diesen
  Benutzer wie eine **Nur-Lesen**-Infrastruktur: Der Menüpunkt **Erstellen**
  fehlt, und Inhalte lassen sich nur ansehen. Den Editor öffnet der Designer
  dann auch für die Organisations- und Systemadministration nicht.
- Ist eine Infrastruktur als **Nur-Lesen** eingerichtet, lassen sich ihre
  Inhalte auch mit Schreibrecht nicht ändern.

:::info Enterprise
Das Recht **Marktplatz veröffentlichen** wirkt nur in der Enterprise-Edition.
Dort zeigt es für die gewählte Infrastruktur den Menüpunkt **Marktplatz
Freigaben** und im Menü einer AAS den Eintrag **Im Marktplatz
veröffentlichen**. Die Rolle **Organisationsadministration** ersetzt das Recht nicht;
**Systemadministration** sieht **Marktplatz Freigaben** auch ohne das Recht.
:::

### Rechte bei neuen Infrastrukturen und Mitgliedern

| Fall | Rechte, die der Designer automatisch vergibt |
|---|---|
| Neue interne Infrastruktur | Alle Mitglieder der Organisation erhalten Lesen, Schreiben und Marktplatz veröffentlichen. |
| Neue externe Infrastruktur | Keine; die Rechte werden im Dialog direkt nach dem Speichern vergeben. |
| Neues Mitglied | Lesen auf die internen Infrastrukturen; mit der Rolle **Organisationsadministration** zusätzlich Schreiben und Marktplatz veröffentlichen. Rechte auf externe Infrastrukturen vergibt die Administration. |

:::warning
Weil eine neue interne Infrastruktur allen Mitgliedern das Recht
**Marktplatz veröffentlichen** gibt, danach unter **Infrastruktur-Zugriffsrechte**
prüfen, wer es wirklich braucht.
:::

## Typische Kombinationen

| Aufgabe | Rollen | Infrastruktur-Rechte |
|---|---|---|
| AAS nur ansehen | **Benutzer** | Lesen |
| AAS anlegen und pflegen | **Benutzer** | Schreiben |
| Produkte im Markt anbieten | **Benutzer** | Schreiben, Marktplatz veröffentlichen |
| Organisation verwalten | **Benutzer**, **Organisationsadministration** | nach Bedarf |

Neue Benutzer erhalten die Rollen schon mit der Einladung. Rechte auf externe
Infrastrukturen werden erst vergeben, nachdem die Einladung angenommen ist.
