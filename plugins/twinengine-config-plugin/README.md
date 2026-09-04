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
