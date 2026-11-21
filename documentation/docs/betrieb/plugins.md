---
sidebar_position: 5
title: Plugins
description: Plugins im Designer installieren, ihren Aufbau mit manifest.json verstehen und die Sicherheitsfolgen beachten.
stichworte:
  Plugins: ''
  Plugin installieren: installieren
  Plugin-Verzeichnis: installieren
  manifest.json: aufbau-eines-plugins
  Backend-Plugin: aufbau-eines-plugins
  Plugin-Archiv: installieren
quellen:
  - services/shared/AasShared/Configuration/AppSettings.cs
  - services/aas-designer/AasDesignerSystemManagementApi/SystemManagement/Plugins/ZipPluginRegistry.cs
  - services/aas-designer/AasDesignerSystemManagementApi/SystemManagement/Plugins/BackendPluginLoader.cs
  - docker-oss/docker-compose.yml
  - tools/docker-compose-wizard/lib/common.sh
  - tools/docker-compose-wizard/oss/create-compose-oss.sh
  - plugins/README.md
  - plugins/bundle-plugin.mjs
  - frontend/libs/designer-app-topbar/src/lib/designer-docs-context.ts
---

# Plugins

Plugins ergänzen den Designer um eigene Anwendungen, z. B. Auswertungen
oder Anbindungen an andere Systeme. Ein Plugin besteht aus einer
Weboberfläche und optional einem Backend-Teil. Für Benutzer erscheint es
unter dem Menüpunkt **Plugins** als Karte mit **Öffnen**; der Menüpunkt ist
nur sichtbar, wenn mindestens ein Plugin für den Benutzer freigegeben ist.

## Installieren

1. Plugin-Verzeichnis festlegen, z. B. über die Umgebungsvariablen des
   Designer-Backends:

   | Variable | Bedeutung | Standard |
   |---|---|---|
   | `AppSettings__PluginsEnabled` | Plugins ein- oder ausschalten | `true` |
   | `AppSettings__PluginDirectory` | Verzeichnis mit den Plugin-Archiven; leer schaltet Plugins ab | leer |
   | `AppSettings__PluginMaxArchiveSizeBytes` | Höchstgröße eines Archivs | 50 MB |
   | `AppSettings__PluginMaxEntrySizeBytes` | Höchstgröße einer Datei im Archiv | 25 MB |

   In Stacks aus dem Compose-Wizard ist das Verzeichnis `plugins/` neben der
   `docker-compose.yml` voreingestellt und wird schreibgeschützt als
   `/app/plugins` eingebunden. Die `.env` steuert das über
   `PLUGINS_ENABLED` (Standard `true`) und `PLUGINS_DIRECTORY` (Standard
   `./plugins`). Enthält das Wizard-Paket das DPP-Explorer-Plugin, legt der
   Wizard es dort bereits ab.
   Die Compose-Dateien unter `docker-oss/` und `docker-enterprise/` binden
   stattdessen den Ordner `plugins/` im Wurzelverzeichnis des Repositorys
   ein.
2. Das Plugin als ZIP-Datei **direkt** in dieses Verzeichnis legen.
   Unterverzeichnisse werden nicht durchsucht.
3. Das Designer-Backend neu starten.

Ungültige Archive werden übersprungen und nur im Log gemeldet. Haben zwei
Plugins dieselbe ID oder Route, wird nur das erste geladen.

## Aufbau eines Plugins

Im Wurzelverzeichnis des Archivs liegt eine `manifest.json`, daneben die
Dateien der Weboberfläche und optional unter `backend/` eine .NET-Bibliothek.

| Feld | Bedeutung |
|---|---|
| `manifestVersion` | immer `1` |
| `type` | `GuiApp` |
| `id` | Kleinbuchstaben, Ziffern und Bindestriche, z. B. `dpp-explorer` |
| `route` | Adresse im Designer, z. B. `/dpp-explorer`; darf keine Route des Designers sein |
| `name`, `description`, `shortLabel` | Anzeige im Menü und auf der Karte |
| `icon` | PrimeIcons-Klasse, z. B. `pi pi-chart-bar` |
| `entryPoint` | Startdatei der Oberfläche, z. B. `index.html` |
| `roles`, `organizationIds` | Optional: nur für bestimmte Rollen oder Organisationen anzeigen |
| `requiresWritableRepo` | Optional: nur anzeigen, wenn die gewählte Infrastruktur beschreibbar ist |
| `backend` | Optional: Bibliothek und Klasse des Backend-Teils |

Die Oberfläche läuft im Designer in einem eingebetteten Frame. Ein
Backend-Teil implementiert `IAasSuiteBackendPlugin` und stellt eigene
Endpunkte unter `/designer-api/plugin-api/<id>/…` bereit.

Beispiele liegen im Repository unter `plugins/`, z. B. `hello-world-demo`
und `dpp-explorer-plugin`. Das Skript
`node plugins/bundle-plugin.mjs` erzeugt daraus ein installierbares Archiv;
Details stehen in `plugins/README.md`.

:::warning Nur vertrauenswürdige Plugins installieren
Ein Plugin läuft mit den Rechten des angemeldeten Benutzers, ein Backend-Teil
sogar mit den vollen Rechten des Designer-Backends. Die Angaben `roles` und
`organizationIds` steuern nur die Anzeige und sind keine Zugriffssperre;
Endpunkte im Backend-Teil müssen ihre Berechtigungen selbst prüfen.
:::
