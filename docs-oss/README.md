# OSS Documentation

Diese Dokumentation beschreibt die OSS-Variante des Portals.

## JSON-Import Von Teilmodellen

Der JSON-Import im Teilmodell-Dialog des Editors akzeptiert ein einzelnes Objekt
mit `modelType: Submodel`. Ein AAS-Environment-Wrapper oder ConceptDescriptions
sind dafuer nicht erforderlich. Die Vorpruefung verwendet denselben Submodel-
Parser wie der eigentliche Import; andere Modelltypen werden dort abgewiesen.

## Verweise Auf Andere AAS Im System

Im Editor kann eine AAS aus der aktuellen AAS-Infrastruktur ueber den Dialog
"AAS auswaehlen" uebernommen werden:

- Entity, Feld Globale Asset-ID: uebernimmt `assetInformation.globalAssetId`
  der gewaehlten AAS. Das ist der spezifikationskonforme Weg, um eine
  `SelfManagedEntity` mit der AAS ihres Assets zu verknuepfen.
- Referenz vom Typ `ModelReference`: setzt genau einen Key
  `AssetAdministrationShell` mit der ID der gewaehlten AAS.
- Referenz vom Typ `ExternalReference`: bei Keys vom Typ `GlobalReference`
  wird die ID der gewaehlten AAS als Wert eingetragen.

Der Viewer zeigt bei Entities den Entity-Typ, die Globale Asset-ID bzw. die
spezifischen Asset-IDs sowie alle Statements an, auch ReferenceElements.

Im Designer-Viewer fuehrt ein Pfeil-Button direkt zur verknuepften AAS:

- bei einer `SelfManagedEntity` neben der Globalen Asset-ID; die AAS wird ueber
  ihre `assetInformation.globalAssetId` in der aktuellen Infrastruktur gesucht,
- bei einem ReferenceElement mit `ModelReference`, dessen erster Key vom Typ
  `AssetAdministrationShell` ist.

Wird keine passende AAS gefunden, erscheint ein Hinweis. In eingebetteten
Viewern ohne Navigationsmoeglichkeit wird der Button nicht angezeigt.

## Asset Interfaces Description Im Viewer

Teilmodelle "Asset Interfaces Description" (IDTA 02017) der Versionen 1.0 und
1.2 werden im Viewer fachlich dargestellt statt als Elementbaum:

- je Schnittstelle Titel, Protokoll, Authentifizierung und Basis-URL (kopierbar,
  bei HTTP direkt oeffenbar),
- alle Datenpunkte (Properties, Actions, Events) als durchsuchbare Baumtabelle
  mit Datentyp, Einheit (gaengige UN/ECE-Codes als Symbol, z. B. `Cel` als
  `°C`), Abruf (z. B. `GET /api/status`) und Live-Kennzeichen (observable),
- Forms und Security-Definitionen unter "Technische Details".

## Darstellung Auf Mobilen Geraeten

Unter 768 px Breite (Smartphones):

- Das Hauptmenue ist ausgeblendet und wird ueber den Menue-Button in der
  Topbar als Overlay geoeffnet; nach der Navigation schliesst es sich wieder.
- Sprache und Organisation sind im Benutzermenue (Avatar) erreichbar.
- Im Viewer zeigen "Zurueck", "Download" und "Editor" nur Icons, und Labels
  von Detailfeldern stehen ueber ihren Werten.

Unter 1280 px Breite zeigt der Viewer statt der Seitenleiste einen kompakten
Kopf (Vorschaubild, idShort, Typ, Globale Asset-ID) und eine fixierte,
horizontal scrollbare Leiste zum Wechsel zwischen AAS-Details und Submodellen.

## QR-Codes Fuer Geteilte Links

Unter "Mein Bereich" > "Geteilte Links" bietet das Aktionsmenue eines Links
den Eintrag "QR-Code". Der Dialog zeigt den Link als QR-Code (schwarz auf
weiss, auch im dunklen Design) und bietet:

- "SVG herunterladen": verlustfrei skalierbare Vektorgrafik, Dateiname
  `shared-link_<AAS-ID>.svg`,
- "Drucken": druckt nur den QR-Code (8 x 8 cm) mit AAS-ID als Ueberschrift
  und dem Link im Klartext darunter.

## Inhalt

- Docker Compose Deployment: [docker-oss/DOCKER_README.md](/Users/christina/_DEV/ML/vws-portal/docker-oss/DOCKER_README.md)
- Docker-Compose-Generator (OSS): [tools/docker-compose-wizard/oss/README.md](/Users/christina/_DEV/ML/vws-portal/tools/docker-compose-wizard/oss/README.md)

## Abgrenzung

`docs-oss/` enthaelt nur Inhalte, die in der Open-Source-Variante verfuegbar oder fuer den OSS-Export relevant sind.

Das gemeinsame Root-Deployment unter [deploy/README.md](/Users/christina/_DEV/ML/vws-portal/deploy/README.md) ist bewusst nicht Teil dieser OSS-Doku, weil es aktuell ein zentrales Dev-Setup fuer das Gesamtprojekt beschreibt.

Der empfohlene Deployment-Pfad fuer OSS ist ein ueber den Wizard erzeugter portabler Stack mit `docker-compose`, `.env`, `stack-assets/` und `postgres-init/`.

## Lokale Entwicklung (Community-Version)

Das Repository enthaelt ein separates VS Code-Workspace-Profil unter `.vscode-oss/`, das auf die Community-Variante zugeschnitten ist.

### Setup

1. Das Projekt in VS Code oeffnen (Workspace-Root: Repository-Root)
2. Das Launch-Target **"Launch Community Stack"** starten – dieses startet gleichzeitig:
   - den Gateway-Service
   - die Designer-API (Community)
   - den Angular Dev-Server der Community-Frontend-App
3. Sobald alle drei Prozesse laufen, kann das Frontend-Debugging ueber das Launch-Target **"Debug AAS Designer Community (Chrome)"** gestartet werden – dieses oeffnet Chrome mit aktiviertem Source-Map-Debugging gegen `http://localhost:5196`.

## Container-Images und Versionen

Die Community-Images werden unter `ghcr.io/meta-level-public/aas-suite-community/<image>` veröffentlicht. Verfügbare Tags:

- `1.4.2` – exakte Version eines Releases (Git-Tag `v1.4.2` im Community-Repository)
- `1.4` bzw. `1` – zeigt immer auf das neueste stabile Release dieser Minor- bzw. Major-Version; Vorabversionen wie `2.0.0-rc.1` verschieben diese Tags nicht
- `latest` – das zuletzt veröffentlichte stabile Release
- `main`, `release`, `sha-<commit>` – Entwicklungs- und Teststände
- ARM64-Images tragen jeweils das Suffix `-arm64`, z. B. `1.4.2-arm64`

Für produktive Installationen empfiehlt sich eine feste Version, z. B. `IMAGE_TAG=1.4.2` in der `.env` des Docker-Compose-Stacks; der Compose-Wizard schlägt standardmäßig die aktuelle Release-Version vor. `latest` wechselt bei jedem Release automatisch und kann dabei Datenbank-Migrationen auslösen. Die Version wird im Frontend über `version.json` angezeigt.

## Initiale AAS-Infrastruktur

Beim Start legt die Designer-API für den Single-Tenant-Betrieb eine initiale Infrastruktur („Internal Infrastructure“) an bzw. gleicht eine bestehende mit den `AppSettings__Initial*`-Werten ab.

| Einstellung | Standard | Bedeutung |
|---|---|---|
| `AppSettings__InitialInfrastructureIsGo` | `true` | Kennzeichnet die initiale Infrastruktur als BaSyx-Go-Infrastruktur. Davon hängen u. a. die DPP-API-Verwaltung und das Neuerstellen von Containern ab. |

Die mit dem Compose-Wizard und unter `deploy/` ausgelieferten Stacks installieren BaSyx Go, dort muss nichts gesetzt werden. Wird eine andere BaSyx-Variante als initiale Infrastruktur angebunden, `AppSettings__InitialInfrastructureIsGo=false` setzen. Der Wert wird bei jedem Start auf die bestehende initiale Infrastruktur übertragen.

Rechte: Wird eine Infrastruktur neu angelegt (initiale Infrastruktur, Go-Infrastruktur über die Oberfläche oder per Infrastruktur-Anfrage), erhalten alle aktiven Benutzer der Organisation Lese-, Schreib- und Markt-Publikationsrechte darauf. Bereits vorhandene Rechte bleiben unverändert.

## Öffentliche DPP-URL

Ist für eine AAS ein DPP konfiguriert, zeigt der Editor die öffentliche DPP-URL mit Kopier-Button an. Grundlage ist die öffentlich erreichbare Basis-URL des DPP-Gateways:

| Einstellung | Standard | Bedeutung |
|---|---|---|
| `AppSettings__DppGatewayPublicUrl` | leer | Öffentliche Basis-URL des DPP-Gateways, z. B. `https://dpp.example.com`. Die angezeigte URL lautet `<Basis-URL>/dpp/v1/dpps/<URL-kodierte AAS-ID>`. Ist der Wert leer, wird keine URL angezeigt. |

In den lokalen Compose-Stacks (`docker-oss/`, `docker-enterprise/`) ist `http://localhost:${DPP_GATEWAY_PORT:-5090}` voreingestellt und kann über `DPP_GATEWAY_PUBLIC_URL` überschrieben werden. In Wizard-Stacks `DPP_GATEWAY_PUBLIC_URL` in der `.env` auf die öffentlich erreichbare Gateway-Adresse setzen. Die URL liefert nur Pässe mit Status `Active`, die im Gateway veröffentlicht sind.

Beim Erzeugen der DPP-Metadaten in beiden Editionen werden die Einträge in `contentSpecificationIds` ohne `idShort` geschrieben, wie für eine AAS-`SubmodelElementList` vorgeschrieben. Ihre Werte und Semantic IDs bleiben erhalten; auch mehrere ausgewählte Content-Spezifikationen erzeugen damit keine doppelten `idShort`-Werte.

Ein unterbrochener Anlegeversuch im Editor kann wiederholt werden: Existiert das Metadaten-Submodell bereits, während die DPP-API noch keinen Pass findet, aktualisiert der Editor nur eindeutig dieser AAS zugeordnete DPP-Metadaten und ergänzt eine fehlende AAS-Referenz. Zusätzliche Metadatenfelder bleiben erhalten; fremde Submodelle werden nicht überschrieben und vorhandene Referenzen nicht dupliziert.
