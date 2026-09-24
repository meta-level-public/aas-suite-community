# DPP Explorer Plugin - Umsetzungskonzept

Status: lauffaehiger erster Stand fuer strukturierte JSON-Passdaten. Die
weiteren Ausbauschritte unten sind noch nicht implementiert.

## Start und Konfiguration

Das Plugin wird wie in `plugins/README.md` beschrieben als ZIP gebaut und vom
AAS-Suite-Backend geladen. Das fertige Archiv liegt unter
`plugins/dpp-explorer-plugin.zip`. Nach Hinzufuegen oder Ersetzen des ZIP muss
der Backend-Container neu gestartet werden. Die Oberflaeche erscheint unter
`/dpp-explorer` im Plugins-Menue.

Das Backend akzeptiert nur JSON-Endpunkte auf freigegebenen Hosts, ausserhalb
von `localhost` ausschliesslich ueber HTTPS. Der
AAS-Suite-DPP-Gateway `dpp.aas-suite.de` ist fuer Pfade unter
`/dpp/v1/dpps/` fest freigegeben. Ebenso ist `localhost` immer erlaubt
(HTTP oder HTTPS, beliebiger Port) und muss nicht eingetragen werden. Weitere Hosts werden im Plugin unter
ueber die kompakte Aktion "Hosts" gespeichert. Diese Funktion steht nur
Nutzern mit `SYSTEM_ADMIN` zur Verfuegung; die Liste gilt global fuer die
Installation. Die angezeigten Beispielpaesse sind lediglich Kurzbefehle zum
Einsetzen einer vollstaendigen URL. Als Startwert ist der oeffentliche
UNTP-Batterie-Testpass hinterlegt. Aenderungen gelten sofort und brauchen
keinen Neustart. Ein Backend-Neustart ist nur nach dem Austausch des
Plugin-ZIPs erforderlich.

Die Konfiguration wird standardmaessig unter
`<Backend-Verzeichnis>/dpp-explorer/sources.json` gespeichert. Fuer Container
mit nicht persistentem Anwendungsverzeichnis kann `DPP_EXPLORER_CONFIG_PATH`
auf einen persistenten, beschreibbaren Pfad zeigen. Diese Variable ist nur fuer
den Speicherort erforderlich, nicht fuer das Hinzufuegen eines Hosts.

In der Oberflaeche die direkte JSON-Daten-URL eingeben. Eine HTML-Seite oder
eine QR-Kennung ohne direktes JSON-Ziel kann dieser erste Stand noch nicht
aufloesen. Die Anfrage erfolgt serverseitig und erfordert eine angemeldete
AAS-Suite-Sitzung. Die Antwort ist auf 2 MB begrenzt; Weiterleitungen werden
nicht verfolgt.

Nach dem Abruf zeigt das Plugin direkt eine fuer Menschen aufbereitete
Passansicht. Fuer UNTP-Paesse mit `credentialSubject` verwendet sie definierte Felder fuer Produktidentitaet,
Batteriedaten, Herstellung, Pass, Dokumente, Nachweise und Materialherkunft.
OpenDPP-Paesse mit passendem JSON-LD-Kontext und `@type` erhalten eine eigene
Ansicht fuer Produkt, Batterie, Herstellung, CO2-Fussabdruck, Konformitaet,
Zertifikate und Materialzusammensetzung. BaSyx-DPPs erhalten ebenfalls eine
eigene Ansicht fuer Passuebersicht und Teilmodelle. Enthaelt der Pass
IDTA-Batteriepass-Teilmodelle, zeigt sie Kennzahlen (Kategorie, Zellchemie,
Kapazitaet, Energie, Spannung, Masse, Lebensdauer, Garantie) und Anzeigen fuer
den Zustand (zertifizierte Energie, Ladezustand, Wirkungsgrad). Messwerte aus
dem Produktzustand erscheinen als Kacheln mit Stand, Listen wie Materialien oder
Ereignisse als Tabellen. Einheiten werden nur fuer eindeutig festgelegte
Felder ergaenzt; Innenwiderstand und Leistung bleiben ohne Einheit. Leere
Teilmodelle werden am Ende gesammelt genannt. Passe mit reinem Typenschild
(z. B. ZVEI Digital Nameplate) erhalten eine Produktansicht mit Logo, Kontakt
und Kennzeichnungen. Alle Formate verwenden dasselbe Layout mit Kopfbereich,
Kennzahlen, Inhaltsnavigation und Symbolen je Feldgruppe. Die Erkennung erfolgt
jeweils anhand des Inhalts, nicht anhand der URL. Andere JSON- und JSON-LD-Paesse erhalten eine generische, verschachtelte
Leseansicht mit Feldnamen, Listen, Messwerten und Links. Fuer die unveraenderten
Quelldaten fuehrt ein Link direkt zur Originalquelle. Die Formatierung ist keine fachliche
Validierung oder Konformitaetspruefung; HTML-Passseiten werden weiterhin
nicht importiert.

Fuer OpenDPP-Materialanteile und UNTP-Massenanteile zeigt die formatierte
Ansicht Liste und Tortendiagramm nebeneinander. UNTP-`massFraction` wird von
0-1 in Prozent umgerechnet; `recycledMassFraction` zaehlt nicht zur Summe.
Fehlende Anteile bis 100 % erscheinen grau; ungueltige Werte oder eine Summe
ueber 100 % unterdruecken das Diagramm.

Zum Neubauen:

```sh
cd plugins/dpp-explorer-plugin
npm install
npm run build
dotnet build backend/DppExplorerBackendPlugin.csproj -c Release
cd ../..
node plugins/bundle-plugin.mjs --source dpp-explorer-plugin
```

Beim Bundler die vorgeschlagenen Werte uebernehmen. Die lokale Angular-
Entwicklungsansicht ist mit `npm start` erreichbar; fuer API-Aufrufe muss das
Plugin im AAS-Suite-Host laufen.

## Ziel und Nutzer

Das Plugin macht einen vorhandenen Digital Product Passport (DPP) innerhalb der
AAS Suite auffindbar und lesbar. Ein Pruefdienstleister wie cetecom advanced
koennte einen Batteriepass neben eigenen Pruefdaten betrachten, die Identitaet
des Prueflings abgleichen und zugehoerige Nachweise finden. Das Plugin erstellt
oder zertifiziert selbst keinen Batteriepass.

Die EU-DPP-Registry ist ein Index fuer Kennungen, Registrierungsdaten und
Metadaten. Vollstaendige Passdaten werden dezentral vom verantwortlichen
Wirtschaftsakteur oder einem beauftragten Dienstleister bereitgestellt. Ein
Registry-Eintrag darf daher in der Oberflaeche nicht als vollstaendiger Pass
ausgegeben werden.

## Geplanter Nutzerablauf

1. Nutzer gibt eine Pass-Daten-URL ein. Spaeter kann ein QR-Scan dieselbe
   Eingabe befuellen. Die Quelle und der erkannte Kennungstyp bleiben sichtbar.
2. Das Plugin loest die Kennung ueber einen konfigurierten, erlaubten Resolver
   auf und ruft die Passdaten vom tatsaechlichen Passanbieter ab.
3. Es zeigt Quelle, Abrufzeit und die vorhandenen Passdaten an.
4. Eine Uebersicht zeigt Identitaet, Hersteller, technische Daten, Dokumente
   und weitere vorhandene Bereiche. Fehlende Daten werden ausgelassen;
   unbekannte Daten bleiben in der generischen Leseansicht verfuegbar.

## Technische Einbettung

```text
plugins/dpp-explorer-plugin/
  README.md
  manifest.json
  src/                           # eingebettete Angular-GuiApp
  backend/                       # .NET-10-Backend
```

- Das Frontend folgt `plugins/hello-world-demo`: statische Angular-App mit
  relativen Assets und `base href="./"`, eingebettet im Plugin-Host.
- Das Manifest verwendet `type: "GuiApp"`, `id: "dpp-explorer-plugin"`,
  `route: "/dpp-explorer"`, `entryPoint: "index.html"` und eine PrimeIcons-
  Klasse. Rollen- und Organisationsbeschraenkungen werden bei Bedarf gesetzt.
- Ein .NET-Backend implementiert `IAasSuiteBackendPlugin` wie das
  `twinengine-config-plugin`. Es exponiert nur benoetigte Endpunkte unter
  `/plugin-api/dpp-explorer`; durch das Gateway sind sie unter
  `/designer-api/plugin-api/dpp-explorer` erreichbar.
- Das Backend kapselt externe Resolver und Passanbieter. So bleiben
  Zugangsdaten serverseitig; Browser-CORS und fremde Authentifizierung gelangen
  nicht in das eingebettete Frontend. Es verwendet die bestehende
  Authentifizierung und Berechtigungspruefung der AAS Suite.
- Ein Adapter pro konkretem Passformat oder Anbieter uebersetzt externe Daten
  in ein gemeinsames Anzeigemodell. Unbekannte Felder werden nicht verworfen.
  AAS-Daten koennen ueber die vorhandenen AAS-Schnittstellen gelesen werden;
  das Plugin nimmt keine dauerhafte Kopie fremder Passdaten als Standard an.

Aktueller interner API-Vertrag:

```text
GET /api/config          -> Quellen und Bearbeitungsrecht
PUT /api/config          -> Quellen speichern (nur SYSTEM_ADMIN)
GET /api/pass?url=...    -> Quell-URL, Abrufzeit, JSON-Rohdaten
```

Resolver, Anbieteradapter und Normalisierung sind naechste Ausbaustufen.

## Schnittstellen und Zugriff

- **Pass-URL:** Primaerer Einstieg fuer den ersten Stand. Eine URL muss direkt
  JSON liefern und auf einem freigegebenen Host liegen.
- **Passanbieter:** Mindestens ein konkret dokumentierter Datenendpunkt und
  dessen Antwortformat sind fuer eine echte Visualisierung erforderlich. Wenn
  nur eine HTML-Seite verfuegbar ist, zeigt das Plugin einen Link statt einen
  vermeintlich strukturierten Datensatz.
- **EU-Registry:** Die Registry ist seit Juli 2026 live und hat eine
  Testumgebung. Eine API zur Registrierung ist angekuendigt. Welche lesenden
  Operationen, Suchkriterien und Rechte fuer dieses Plugin verfuegbar sind,
  wird anhand der aktuellen technischen Dokumentation und eines Testkontos
  verifiziert. Registry-Suche ist keine Voraussetzung fuer das MVP.
Das Backend darf keine beliebigen vom Nutzer gelieferten URLs abrufen:
erlaubte Hosts/Resolver konfigurieren, Redirects erneut pruefen, private
Netzadressen ausschliessen und Timeouts sowie Antwortgroessen begrenzen.
Tokens werden nicht im Plugin-ZIP oder Browser gespeichert. Fremde HTML-Inhalte
werden nicht als vertrauenswuerdiges Markup gerendert. Berechtigungen des
Passanbieters bleiben massgeblich; ein 403 oder gesperrtes Feld wird angezeigt,
nicht umgangen.

## Umsetzung in Etappen

1. **Machbarkeit:** Ein realer oder offizieller Testpass, QR-Inhalt,
   Datenendpunkt und Nutzungsrechte festlegen. Registry-
   Testumgebung und API-Dokumentation auf lesenden Zugriff pruefen.
2. **MVP:** Plugin-Geruest, Kennung/URL-Eingabe, genau ein Resolver/Adapter,
   Passansicht mit Quellenlink und Provenienz sowie eine klare Fehleranzeige.
3. **Ausbau:** QR-Kamera, weitere Anbieter/Passformate und Registry-Integration
   bei verfuegbarem Lesezugriff.

Abnahme fuer das MVP: Ein Nutzer kann einen bekannten Pass reproduzierbar
oeffnen, dessen Quelle erkennen, strukturierte Daten und Dokumente sehen und
einen nicht erreichbaren Pass eindeutig von einem leeren Pass unterscheiden.

## Offene Entscheidungen vor der Implementierung

- Welcher konkrete Passanbieter und welches Datenformat dienen als erster
  durchgaengiger Testfall?
- Welche Kennung verbindet bei cetecom advanced Pruefauftrag, Batterie und
  Herstellerpass verlaesslich?
- Welche Pruefergebnisse duerfen an Hersteller weitergegeben werden und welche
  sollen nur intern verglichen werden?

## Quellen

- EU-Kommission, Registry und dezentrale Datenhaltung:
  https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/dpp-registry_en
- EU-Kommission, Start der Registry und Testumgebung (20.07.2026):
  https://single-market-economy.ec.europa.eu/news/digital-product-passport-registry-now-live-2026-07-20_en
- Lokaler Plugin-Vertrag: `plugins/README.md`
