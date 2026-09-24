# TwinEngine Configuration Plugin

Angular-Oberfläche und integriertes .NET-Backend zum Bearbeiten und Exportieren einer begrenzten TwinEngine-Konfiguration.

Das frühere `twinengine-config-plugin-api` wird nicht mehr als separater Node-/Docker-Service benötigt. Das Backend liegt jetzt unter `backend/` und wird als Teil desselben Plugin-ZIPs geladen.

## Entwicklung

```sh
npm install
npm run build
dotnet build backend/TwinEngineConfigBackendPlugin.csproj
```

Das Plugin wird mit `plugins/bundle-plugin.mjs` gebündelt. Im Bundler müssen als Backend-Werte verwendet werden:

```text
Assembly: TwinEngineConfigBackendPlugin.dll
Type: TwinEngineConfigBackendPlugin.TwinEngineConfigBackendPlugin
```

Die API ist danach über das Plugin verfügbar. Für die reine Aktivierung des Plugins ist kein eigener Compose-Service notwendig.

```text
/designer-api/plugin-api/twinengine-config/api/config
/designer-api/plugin-api/twinengine-config/api/config/validate
/designer-api/plugin-api/twinengine-config/api/config/export
/designer-api/plugin-api/twinengine-config/api/config/recreate-dataengine
/designer-api/plugin-api/twinengine-config/api/config/history
/designer-api/plugin-api/twinengine-config/api/config/history/{version}
/designer-api/plugin-api/twinengine-config/api/config/defaults
```

## Erlaubte Konfiguration

Das Plugin trennt die Konfiguration in „Data Engine“ mit einer dynamischen Liste von Standardspracheinstellungen, Submodel- und Shell-Template-Mappings sowie einer AAS-ID-Extraktionsregel und „DPP Plugin“ mit Submodel-Namen-Extraktionsregeln sowie einer Produkt-ID-Extraktionsregel. Sprachen, Submodel-Mappings, Extraktionsregel-Gruppen und deren Pattern können in der Oberfläche hinzugefügt oder gelöscht werden. Mindestens eine Sprache und ein Pattern je Extraktionsregel müssen erhalten bleiben.

Der Export schreibt ausschließlich diese Umgebungsvariablen:

- `Plugins__MultiLanguageProperty__DefaultLanguages__N`
- `TemplateManagement__TemplateMappingRules__SubmodelTemplateMappings__N__templateId`
- `TemplateManagement__TemplateMappingRules__SubmodelTemplateMappings__N__pattern__0`
- `TemplateManagement__TemplateMappingRules__ShellTemplateMappings__0__templateId`
- `TemplateManagement__TemplateMappingRules__ShellTemplateMappings__0__pattern__0`
- `TemplateManagement__TemplateMappingRules__AasIdExtractionRules__0__Strategy`
- `TemplateManagement__TemplateMappingRules__AasIdExtractionRules__0__Pattern`
- `TemplateManagement__TemplateMappingRules__AasIdExtractionRules__0__Index`
- `ExtractionRules__SubmodelNameExtractionRules__N__SubmodelName`
- `ExtractionRules__SubmodelNameExtractionRules__N__pattern__N`
- `ExtractionRules__ProductIdExtractionRules__0__Pattern`
- `ExtractionRules__ProductIdExtractionRules__0__Index`
- `ExtractionRules__ProductIdExtractionRules__0__Strategy`
- `ExtractionRules__ProductIdExtractionRules__0__Description`

Andere TwinEngine-Parameter werden weder über die API oder Oberfläche gespeichert noch in die jeweiligen `.env`-Dateien exportiert.

### Optionale Docker-Konfiguration

Die Repository-Compose-Dateien enthalten bewusst keine TwinEngine-spezifische Volume- oder Pfadkonfiguration. Wenn dieses Plugin eingesetzt wird, muss der Designer-Backend-Service in den verwendeten Compose-Stack aufgenommen bzw. angepasst werden. Der Plugin-Export schreibt zwei Dateien in einen Host-Bind-Mount: eine für `twinengine-dataengine` und eine für das DPP Plugin.

```yaml
environment:
  - TWINENGINE_CONFIG_PATH=/app/twinengine-config/config.json
	- TWINENGINE_DATAENGINE_EXPORT_PATH=/app/generated-config/twinengine-dataengine.env
	- TWINENGINE_DPP_PLUGIN_EXPORT_PATH=/app/generated-config/twinengine-dpp-plugin.env
```

Die Datei `env_file` wird von Docker Compose auf dem Host gelesen. Deshalb muss der Backend-Container den Host-Ordner `./generated-config` beschreibbar mounten; ein ausschließlich internes Named Volume reicht für `env_file` nicht aus:

```yaml
services:
	aas-designer-enterprise:
		environment:
		environment:
			- TWINENGINE_CONFIG_PATH=/app/twinengine-config/config.json
			- TWINENGINE_DATAENGINE_EXPORT_PATH=/app/generated-config/twinengine-dataengine.env
			- TWINENGINE_DPP_PLUGIN_EXPORT_PATH=/app/generated-config/twinengine-dpp-plugin.env
		volumes:
			- ./generated-config:/app/generated-config
			- twinengine-config-data:/app/twinengine-config

	twinengine-dataengine:
		env_file:
			- ./generated-config/twinengine-dataengine.env

	dpp-plugin:
		env_file:
			- ./generated-config/twinengine-dpp-plugin.env

volumes:
	twinengine-config-data:
		driver: local
```

Für Community muss entsprechend `aas-designer-community` verwendet werden. Beim ersten Start müssen die Dateien noch nicht existieren; nach dem ersten Export liegen sie unter `./generated-config/twinengine-dataengine.env` und `./generated-config/twinengine-dpp-plugin.env`. Danach müssen die betroffenen Dienste neu gestartet werden, damit sie die aktualisierten ENV-Werte übernehmen.

Der Backend-Pfad und der Compose-`env_file`-Pfad sind absichtlich verschieden: `/app/generated-config/...` ist der Containerpfad, `./generated-config/...` der Hostpfad. Beide zeigen auf dieselben Dateien. Ohne die beiden Exportpfadvariablen verwendet das Plugin lokale Fallbacks relativ zum Backend-Prozess.

Die Oberfläche speichert Entwürfe, validiert sie und erzeugt einen Export; der laufende DataEngine-Container wird dabei nicht automatisch neu gestartet.

### Verlauf gespeicherter Versionen

Bei jedem Speichern eines Entwurfs (`PUT /api/config`) legt das Backend zusätzlich eine Kopie unter `twinengine-config/history/config.v{N}.json` ab. Es werden nur die letzten 10 Versionen aufbewahrt, ältere werden automatisch gelöscht. Über `GET /api/config/history` lässt sich der Verlauf (Version + Zeitstempel) abrufen, über `GET /api/config/history/{version}` eine konkrete Version laden. Das Laden einer alten Version überschreibt die aktuell gespeicherte Konfiguration nicht sofort – sie wird nur als Entwurf in die Oberfläche geladen und muss über „Entwurf speichern“ erneut bestätigt werden (dabei erhält sie automatisch die nächsthöhere Versionsnummer).

### Standardwerte wiederherstellen

Über „Standard wiederherstellen“ (unter „Weitere Aktionen“) ruft die Oberfläche `GET /api/config/defaults` auf und lädt die eingebauten Standardwerte als Entwurf – nach Bestätigung eines Sicherheitshinweises. Auch hier wird nichts sofort gespeichert; erst „Entwurf speichern“ persistiert die Standardwerte als neue Version. Das hilft, wenn eine gespeicherte Version beschädigt ist oder keine Werte mehr anzeigt.

### DataEngine-Container neu erstellen

Der Button „DataEngine neu erstellen“ ruft `POST /api/config/recreate-dataengine` auf. Da Docker Umgebungsvariablen aus `env_file` nur bei der Container-Erstellung liest, reicht ein einfacher Neustart nicht aus, um neu exportierte Werte zu übernehmen. Das Backend spricht dazu direkt die Docker Engine API an, findet den laufenden `twinengine-dataengine`-Container (per Compose-Label `com.docker.compose.service=twinengine-dataengine` oder per `TWINENGINE_DATAENGINE_CONTAINER_NAME`), entfernt ihn und erstellt ihn mit identischer Konfiguration neu, wobei die zuvor exportierten Umgebungsvariablen aktualisiert werden.

Voraussetzungen:

- Der Backend-Container benötigt Zugriff auf den Docker-Socket, z. B.:
  ```yaml
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
  environment:
    - TWINENGINE_DOCKER_HOST=unix:///var/run/docker.sock
  ```
- Alternativ kann `TWINENGINE_DOCKER_HOST` auf eine TCP-Docker-API zeigen (z. B. `tcp://172.17.0.1:2375`), falls kein Socket gemountet werden soll.
- `TWINENGINE_DATAENGINE_CONTAINER_NAME` kann optional gesetzt werden, um den Container über seinen Namen statt über das Compose-Label zu finden.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.34.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
