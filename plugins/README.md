# AAS Suite GUI Plugins

This folder contains GUI plugins for the AAS Suite backend plugin directory. The backend scans ZIP files directly in this folder when the local Docker templates mount `../plugins` to `/app/plugins`.

## Quick Start

Build and bundle the demo plugin:

```bash
cd plugins/hello-world-demo
pnpm install
pnpm build
cd ..
node bundle-plugin.mjs
```

Use the defaults in the bundling script to create `plugins/hello-world-demo.zip`. Start or restart the AAS Suite container afterwards. The frontend shows a `Plugins` entry in the sidebar and lists `Hello World Demo`. Opening it navigates to `/hello-world-demo` and loads the compiled plugin app.

## What an external developer needs to know

This section summarises the minimum information needed to build a custom `GuiApp` plugin that works in the AAS Suite.

1. Create a ZIP archive in the repository-level `plugins/` folder.
2. Put a root-level `manifest.json` into the archive.
3. Set `"type": "GuiApp"` in the manifest.
4. Choose a unique `id` and a unique top-level route such as `/my-plugin`.
5. Make the generated frontend static and embeddable inside the app, typically as an Angular build or any static SPA that can load from an iframe.
6. Use relative asset paths. For Angular this usually means a base href like `./` or an equivalent build setting.
7. Put the build output in the archive root so the `entryPoint` file is reachable from the manifest.
8. Optionally include a backend assembly in a `backend/` directory and reference the shipped `AasSuitePluginAbstractions` contract for .NET plugin endpoints.
9. Bundle the plugin with `node plugins/bundle-plugin.mjs` and place the resulting ZIP in the runtime plugin directory. For the supplied Docker templates this is the `plugins/` directory at the repository root.
10. Restart the backend/container after adding or replacing a plugin ZIP.

A plugin is only visible to the user if the backend successfully scans the ZIP, reads `manifest.json`, verifies the manifest fields, and the user matches the configured role and organization restrictions.

## Where `GuiApp` plugins are shown in the application

`GuiApp` plugins are not mounted as a separate runtime service. They are discovered from ZIP files in the configured plugin directory and then surfaced by the app in three stages:

- The backend scans `*.zip` files in the plugin folder and reads each archive's `manifest.json`.
- The backend exposes the plugin metadata to the frontend through `/system-management-api/Plugins/menu-items`.
- The frontend loads these entries and adds a `Plugins` entry to the sidebar when at least one valid plugin is available.

From there, each plugin uses the manifest `route` as its Angular route, for example `/hello-world-demo`. The app registers these routes dynamically and loads the plugin through the plugin host component. The plugin asset endpoint is served under `/system-management-api/Plugins/{pluginId}/assets/...` and the frontend embeds the plugin's `entryPoint` document in the host view.

This means the plugin is normally visible in the app as:

- a sidebar entry named `Plugins`
- a plugin overview screen listing all available entries
- a dedicated route like `/my-plugin` that opens the plugin's entry point

The route must not collide with reserved AAS Suite routes such as `/plugins`, `/shells-list`, `/submodels`, `/my-space`, `/system-management`, or `/error`.

## Concrete example: the included Hello World plugin

The repository already contains a working demo plugin in `plugins/hello-world-demo`. It is a good template for a custom `GuiApp` plugin and shows the intended lifecycle:

1. Build the frontend app in `plugins/hello-world-demo`.
2. Package it with the bundler script.
3. Generate a ZIP containing `manifest.json` and the compiled frontend assets.
4. Copy the ZIP into the runtime plugin directory (`plugins/` in the repository root for the local Docker setup).
5. Restart the backend/container so the plugin is rediscovered.
6. The app then shows a `Plugins` item in the sidebar, lists the plugin, and opens it at the route defined in the manifest, for example `/hello-world-demo`.

The demo plugin is therefore the best first reference for external teams: it shows the required ZIP structure, the manifest layout, and the expected user-visible flow in the app.

## Starting from the Hello World plugin in 5 steps

Use [plugins/hello-world-demo](plugins/hello-world-demo) as the template for a new plugin:

1. Copy the folder and rename it to your plugin ID, for example `my-plugin`.
2. Update the Angular app name and route in the generated frontend so it matches your desired route, for example `/my-plugin`.
3. Update `manifest.json` with your unique `id`, `route`, `name`, `entryPoint`, and optional metadata such as `description`, `roles`, or `organizationIds`.
4. Build the frontend and run the bundler script so the plugin is packaged as a ZIP with `manifest.json` at the archive root.
5. Place the ZIP in the runtime plugin directory, restart the backend or container, and verify that the app shows the `Plugins` menu entry and opens your route.

This workflow mirrors the repository's demo plugin and keeps the custom plugin aligned with the supported AAS Suite plugin contract.

## ZIP Structure

The ZIP must contain `manifest.json` at the archive root. The compiled static frontend files must also be in the archive root or below it.

Example:

```text
manifest.json
index.html
main-ABC123.js
styles-ABC123.css
assets/logo.svg
backend/
  MyPlugin.dll
  MyPlugin.deps.json
  MyPlugin.runtimeconfig.json
```

## Manifest Fields

Required fields:

```json
{
  "manifestVersion": 1,
  "id": "hello-world-demo",
  "route": "/hello-world-demo",
  "name": "Hello World Demo",
  "icon": "pi pi-question-circle",
  "entryPoint": "index.html",
  "type": "GuiApp"
}
```

Optional fields:

```json
{
  "description": "Short text shown in the plugin overview.",
  "shortLabel": "HELLO",
  "requiredRole": "BENUTZER",
  "requiresWritableRepo": false,
  "sortOrder": 100,
  "version": "1.0.0",
  "author": "Your company",
  "organizationIds": [42, 84],
  "roles": ["BENUTZER", "ORGA_ADMIN"]
}
```

`type` is required and currently must be `GuiApp`. `SubmodelViewer` and `SaveInterceptor` are reserved for future plugin implementations and are ignored by the current GUI plugin registry. Empty `organizationIds` or `roles` lists mean that the corresponding restriction is disabled. When both lists are set, both restrictions must match; multiple roles are combined with OR. The plugin is visible only for the current organization and roles, and direct asset requests are protected by the same rules.

For a backend extension, add the optional `backend` object. The assembly must implement `IAasSuiteBackendPlugin` from the shipped `AasSuitePluginAbstractions` contract:

```json
{
  "backend": {
    "assembly": "backend/MyPlugin.dll",
    "type": "MyPlugin.MyPluginBackend"
  }
}
```

Rules enforced by the backend:

- `manifestVersion` must be `1`.
- `id` must be URL-safe, for example `my-plugin`.
- `route` must be a unique top-level route, for example `/my-plugin`.
- Reserved AAS Suite routes such as `/plugins`, `/shells-list`, `/submodels`, `/my-space`, `/system-management`, `/public-viewer`, `/error` and `/forbidden` are not allowed.
- `icon` must be a PrimeIcons class beginning with `pi pi-`.
- `entryPoint` must point to an existing file in the ZIP, usually `index.html`.

## Creating a Plugin

1. Create an Angular app.
2. Make sure it can run as a static app inside an iframe.
3. Use relative asset paths. For Angular, set `<base href="./">` or build with an equivalent base href.
4. Build the app.
5. Optionally create a .NET 10 class library in a `backend/` folder. Reference the `AasSuitePluginAbstractions` project or a compatible published contract package, implement `IAasSuiteBackendPlugin`, and expose only the routes/services your plugin needs.
6. Run `node plugins/bundle-plugin.mjs` from this folder and answer the prompts. The script can build the frontend and backend and asks for all required and optional manifest values.
7. Place the generated ZIP in the backend plugin directory. For the repository Docker templates, this is this `plugins/` folder.

Use `node plugins/bundle-plugin.mjs --defaults` only for the included demo. It builds the default demo values non-interactively.

The backend plugin loader is intended for trusted code only. A loaded .NET DLL runs in the same process and with the same permissions as the AAS Suite backend. Invalid plugins are logged and skipped, but backend plugin installation still requires a backend restart.

The demo backend exposes `GET /plugin-api/hello-world-demo/message` and is packaged together with the frontend when the bundler's backend option is enabled.
When the AAS Suite gateway is used, the same endpoint is available below `/designer-api/plugin-api/hello-world-demo/message`.