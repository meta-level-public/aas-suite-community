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

## ZIP Structure

The ZIP must contain `manifest.json` at the archive root. The compiled static frontend files must also be in the archive root or below it.

Example:

```text
manifest.json
index.html
main-ABC123.js
styles-ABC123.css
assets/logo.svg
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
  "entryPoint": "index.html"
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
  "author": "Your company"
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
5. Run `node plugins/bundle-plugin.mjs` from this folder and answer the prompts.
6. Place the generated ZIP in the backend plugin directory. For the repository Docker templates, this is this `plugins/` folder.

The plugin backend does not execute server code from the ZIP. It only serves static files and exposes the metadata from `manifest.json`.