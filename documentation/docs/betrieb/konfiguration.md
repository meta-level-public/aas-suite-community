---
sidebar_position: 3
title: Konfiguration
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

**Rechte:** Wird eine Infrastruktur neu angelegt (initiale Infrastruktur,
Go-Infrastruktur über die Oberfläche oder per Infrastruktur-Anfrage), erhalten
alle aktiven Benutzer der Organisation Lese-, Schreib- und
Markt-Publikationsrechte darauf. Bereits vorhandene Rechte bleiben
unverändert.

## Öffentliche DPP-URL

Ist für eine AAS ein DPP konfiguriert, zeigt der Editor die öffentliche
DPP-URL an. Grundlage ist die öffentlich erreichbare Basis-URL des
DPP-Gateways:

| Einstellung | Standard | Bedeutung |
|---|---|---|
| `AppSettings__DppGatewayPublicUrl` | leer | Öffentliche Basis-URL des DPP-Gateways, z. B. `https://dpp.example.com`. Die angezeigte URL lautet `<Basis-URL>/dpp/v1/dpps/<URL-kodierte AAS-ID>`. Ist der Wert leer, wird keine URL angezeigt. |

In den lokalen Compose-Stacks (`docker-oss/`, `docker-enterprise/`) ist
`http://localhost:${DPP_GATEWAY_PORT:-5090}` voreingestellt und kann über
`DPP_GATEWAY_PUBLIC_URL` überschrieben werden. In Wizard-Stacks
`DPP_GATEWAY_PUBLIC_URL` in der `.env` auf die öffentlich erreichbare
Gateway-Adresse setzen.

## Link zum Handbuch

Siehe [Handbuch bereitstellen](./handbuch-bereitstellen.md#handbuch-in-designer-und-markt-verlinken).
