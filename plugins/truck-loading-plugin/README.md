# Lkw-Beladung (Demo-Plugin)

Interaktive Demo für einen Holzmodell-Lkw: Teile aus einem der konfigurierten
Repositories werden in die sechs Kisten auf dem Ladetablett geladen. Die
Ladeliste steht im digitalen Zwilling selbst, in den AAS von Lkw und Kisten.
Wer die Lkw-AAS öffnet, sieht die Ladung im Viewer als Stückliste und kommt per
Klick zur AAS jedes geladenen Teils.

## Physisches Modell

- Ladetablett 47 × 89 mm, herausziehbar
- 6 Kisten je 22 × 28 × 40 mm im Raster 2 × 3; Stellplätze `A1` … `B3`,
  Reihe 1 am Fahrerhaus
- Kisten sind tauschbar und über QR-Etiketten (K-01 … K-06) unterscheidbar

## Datenmodell

Beide Teilmodelle folgen IDTA *Hierarchical Structures enabling Bills of
Material* (`https://admin-shell.io/idta/HierarchicalStructures/1/1/Submodel`),
das der Viewer der AAS Suite als Diagramm darstellt.

```text
Lkw-AAS (erkannt am Teilmodell "Ladung"; ein neu angelegter Demo-Lkw
         zusätzlich am assetType urn:aas-suite:demo:truck-loading:truck)
 └─ Teilmodell "Ladung" (ArcheType Full)
     └─ Lkw (EntryNode)
         └─ Ladetablett
             └─ Kiste_K03 (globalAssetId der Kiste, Property Stellplatz = "B2")

Kisten-AAS (assetType urn:aas-suite:demo:truck-loading:box, idShort Kiste_K01 …)
 └─ Teilmodell "Inhalt" (ArcheType OneDown)
     └─ Kiste_K03 (EntryNode)
         └─ Teil_… (globalAssetId des Teils, ReferenceElement "Aas",
                    QuellInfrastruktur, ViewerLink, GeladenAm)
```

Der Stellplatz gehört zum Lkw, der Inhalt zur Kiste. Wird eine Kiste
umgesetzt, ändert sich nur die Ladung des Lkw; der Inhalt wandert mit.
Die Teile werden nur referenziert, ihre AAS bleibt im Quell-Repository.

Teilmodell-IDs: `<AAS-ID>/submodels/Ladung` bzw. `<AAS-ID>/submodels/Inhalt`.

## Technik

- Reine Weboberfläche ohne Backend-Teil.
- Lesen über den aas-proxy (`/designer-api/aas-proxy/<infra>/…`, nur GET).
- Schreiben über die Speicher-Endpunkte des Designers
  (`aas-api/Shells/Create`, `aas-api/Shells/Save`, `aas-api/Submodel/SaveSm`).
  Dafür braucht der Benutzer die Rolle zur AAS-Bearbeitung.
- Die Demo-Infrastruktur wird im Plugin gewählt und per `X-Infrastructure-ID`
  mitgeschickt, unabhängig von der Auswahl im Designer.
- Vor jeder Änderung liest das Plugin das Teilmodell neu, damit Änderungen von
  einem zweiten Gerät erhalten bleiben. Der Vorführmodus lädt alle 5 Sekunden neu.

## Bedienung

1. **Demo einrichten:** Beschreibbare Infrastruktur wählen und die bestehende
   AAS des Lkw über „Als Lkw verwenden“ auswählen. Sie bekommt nur zusätzlich
   das Teilmodell „Ladung“; ID, globalAssetId, assetType und die anderen
   Teilmodelle bleiben unverändert. Gibt es keine Lkw-AAS, legt
   „Demo-Lkw neu anlegen“ eine an. Danach legt das Plugin fehlende
   Kisten-AAS an. Lkw und Kisten liegen in derselben Infrastruktur; pro
   Infrastruktur sollte es nur eine AAS mit dem Teilmodell „Ladung“ geben.
2. **Beladen:** Stellplatz wählen, Kiste zuordnen, Teil aus einem
   Quell-Repository suchen und einladen.
3. **Vorführmodus:** große Draufsicht mit Ladeliste für ein Tablet am Lkw.
4. **Etiketten:** QR-Etiketten für Lkw (30 × 38 mm) und Kisten (18 × 24 mm)
   drucken, Skalierung 100 %. Die QR-Codes führen zum Viewer der jeweiligen AAS.

## Bauen und installieren

```sh
cd plugins/truck-loading-plugin
npm install
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
cd ..
node bundle-plugin.mjs --source truck-loading-plugin --defaults
```

`plugins/truck-loading-plugin.zip` in das Plugin-Verzeichnis des
Designer-Backends legen und das Backend neu starten.

## Nächste Schritte

- QR-Scan der Kisten per Handykamera im Plugin
- Öffentliche Links (Public Viewer) auf den Etiketten, damit Besucher ohne
  Anmeldung scannen können
