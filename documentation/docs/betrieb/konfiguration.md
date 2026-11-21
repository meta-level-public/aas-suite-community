---
sidebar_position: 3
title: Konfiguration
description: Einstellungen der Designer-API für die initiale AAS-Infrastruktur, voreingestellte Infrastruktur-Rechte und die öffentliche DPP-URL.
stichworte:
  Initiale Infrastruktur: initiale-aas-infrastruktur
  BaSyx Go: initiale-aas-infrastruktur
  Infrastruktur-Rechte: rechte-auf-neuen-infrastrukturen
  DPP-Gateway: öffentliche-dpp-url
  DppGatewayPublicUrl: öffentliche-dpp-url
  InitialInfrastructureIsGo: initiale-aas-infrastruktur
quellen:
  - services/shared/AasShared/Configuration/AppSettings.cs
  - services/aas-designer/AasDesignerApi/Utils/SingleTenantInfrastructureUtil.cs
  - services/aas-designer/AasDesignerCommon/Utils/InfrastrukturRechteUtil.cs
  - services/aas-designer/AasDesignerApi/Orga/InfrastructureRequester.cs
  - services/aas-designer/AasDesignerAasApi/Infrastructure/Commands/CreateGoInfrastructure/CreateGoInfrastructureCommand.cs
  - services/aas-designer/AasDesignerApi/Authorization/UserService.cs
  - docker-oss/docker-compose.dpp-security.yml
  - tools/docker-compose-wizard/lib/common.sh
---

# Konfiguration

## Initiale AAS-Infrastruktur

Beim Start legt die Designer-API für den Single-Tenant-Betrieb eine initiale
Infrastruktur („Internal Infrastructure“) an bzw. gleicht eine bestehende mit
den `AppSettings__Initial*`-Werten ab.

| Einstellung | Standard | Bedeutung |
|---|---|---|
| `AppSettings__InitialInfrastructureIsGo` | `true` | Kennzeichnet die initiale Infrastruktur als BaSyx-Go-Infrastruktur. Davon hängen u. a. die DPP-API-Verwaltung und das Neuerstellen von Containern ab. |

Die mit dem Compose-Wizard und unter `deploy/` ausgelieferten Stacks
installieren BaSyx Go, dort muss nichts gesetzt werden. Wird eine andere
BaSyx-Variante als initiale Infrastruktur angebunden,
`AppSettings__InitialInfrastructureIsGo=false` setzen. Der Wert wird bei jedem
Start auf die bestehende initiale Infrastruktur übertragen.

### Rechte auf neuen Infrastrukturen

Wird eine Infrastruktur neu angelegt (initiale Infrastruktur,
Go-Infrastruktur über die Oberfläche oder per Infrastruktur-Anfrage), erhalten
alle aktiven Benutzer der Organisation Lese-, Schreib- und
Markt-Publikationsrechte darauf. Bereits vorhandene Rechte bleiben
unverändert.

Benutzer, die erst nach dem Anlegen per Single Sign-on zur Organisation
kommen, erhalten auf der internen Infrastruktur nur das Leserecht; Benutzer
mit der Rolle **Organisationsadministration** zusätzlich Schreiben und das Recht „Marktplatz
veröffentlichen“.

:::warning Recht „Marktplatz veröffentlichen“
In der Enterprise-Edition darf jeder Benutzer mit diesem Recht AAS der
Infrastruktur sofort öffentlich anbieten, ohne Freigabe. Soll das nur ein
kleiner Kreis dürfen, das Recht nach dem Anlegen einer Infrastruktur unter
[Organisation › Benutzer](../designer/organisation.md#benutzer) entziehen.
In der Community-Edition hat das Recht keine Wirkung.
:::

## Öffentliche DPP-URL

Ist für eine AAS ein DPP konfiguriert, zeigt der Editor die öffentliche
DPP-URL an. Grundlage ist die öffentlich erreichbare Basis-URL des
DPP-Gateways:

| Einstellung | Standard | Bedeutung |
|---|---|---|
| `AppSettings__DppGatewayPublicUrl` | leer | Öffentliche Basis-URL des DPP-Gateways, z. B. `https://dpp.example.com`. Die angezeigte URL lautet `<Basis-URL>/dpp/v1/dpps/<URL-kodierte AAS-ID>`. Ist der Wert leer, wird keine URL angezeigt. |

In den Entwicklungs-Stacks unter `docker-oss/` und `docker-enterprise/` setzt
erst die Zusatzdatei `docker-compose.dpp-security.yml` den Wert auf
`http://localhost:${DPP_GATEWAY_PORT:-5090}`; überschreiben lässt er sich mit
`DPP_GATEWAY_PUBLIC_URL`. In Wizard-Stacks ist der Wert zunächst leer:
`DPP_GATEWAY_PUBLIC_URL` in der `.env` auf die öffentlich erreichbare
Gateway-Adresse setzen und den Stack neu starten.

## Link zum Handbuch

Siehe [Handbuch bereitstellen](./handbuch-bereitstellen.md#handbuch-in-designer-und-markt-verlinken).
