#!/usr/bin/env node
// Wegwerf-Stack für die Handbuch-Aufnahmen: erzeugt mit dem Compose-Wizard einen vollständigen Stack
// (Gateway, APIs, Keycloak, BaSyx, Datenbanken, Designer, bei Enterprise auch Markt) auf freien Ports,
// startet ihn mit eigenen Volumes und räumt ihn wieder ab.
//
// Aufruf (aus documentation/):
//   node scripts/screenshots/stack.mjs up   [--edition enterprise|oss] [--skip-build]
//   node scripts/screenshots/stack.mjs down [--edition enterprise|oss]
//
// Die Images werden aus dem aktuellen Checkout gebaut (Tag "handbuch", damit lokale Images mit dem Tag
// "local" unberührt bleiben). --skip-build bzw. HANDBUCH_SKIP_BUILD=1 verwendet vorhandene Images.
// Enterprise: HANDBUCH_LICENSE_FILE zeigt auf eine Test-Lizenz (JSON, Lizenznehmer "Demo") für
// lizenzpflichtige Funktionen und gegen den Lizenzhinweis in jedem Bild; der Seed lädt sie hoch. Standard: tmp/license-Demo-Designer.json
// im Repository (tmp/ ist nicht eingecheckt). Die Lizenz wird nie eingecheckt.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..', '..');
export const STACK_ROOT = join(here, '.stack');
const IMAGE_TAG = 'handbuch';
const LICENSE_FILE = resolve(process.env.HANDBUCH_LICENSE_FILE || join(repoRoot, 'tmp', 'license-Demo-Designer.json'));
const DOCS_BASE_URL = process.env.HANDBUCH_DOCS_BASE_URL || 'https://docs.aas-suite.de';

const EDITIONS = {
  enterprise: {
    wizard: 'tools/docker-compose-wizard/enterprise/create-compose-enterprise-non-interactive.sh',
    build: 'tools/docker-compose-wizard/enterprise/build-local-images-enterprise.sh',
    backendService: 'aas-designer-enterprise',
    imageKeys: [
      'DESIGNER_BACKEND',
      'GATEWAY',
      'FRONTEND',
      'MARKT',
      'MARKT_UI',
      'FEEDMAPPING',
      'HEALTH_DASHBOARD',
      'DPP_GATEWAY',
    ],
  },
  oss: {
    wizard: 'tools/docker-compose-wizard/oss/create-compose-oss-non-interactive.sh',
    build: 'tools/docker-compose-wizard/oss/build-local-images-oss.sh',
    backendService: 'aas-designer-community',
    imageKeys: ['DESIGNER_BACKEND', 'GATEWAY', 'FRONTEND', 'DPP_GATEWAY'],
  },
};

const PORT_KEYS = [
  'GATEWAY_HOST_PORT',
  'KEYCLOAK_HOST_PORT',
  'DPP_GATEWAY_HOST_PORT',
  'AAS_REPOSITORY_HOST_PORT',
  'SUBMODEL_REPOSITORY_HOST_PORT',
  'CONCEPT_DESCRIPTION_REPOSITORY_HOST_PORT',
  'AAS_REGISTRY_HOST_PORT',
  'SUBMODEL_REGISTRY_HOST_PORT',
  'AAS_DISCOVERY_HOST_PORT',
];

export const stackDir = (edition) => join(STACK_ROOT, edition);
export const stackInfoFile = (edition) => join(stackDir(edition), 'stack.json');
const projectName = (edition) => `aas-handbuch-${edition}`;

function run(command, args, options = {}) {
  console.log(`> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit', cwd: repoRoot, ...options });
  if (result.status !== 0) {
    throw new Error(`Befehl fehlgeschlagen (${result.status}): ${command} ${args.join(' ')}`);
  }
}

function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolvePort(port));
    });
  });
}

function readValues() {
  const values = {};
  for (const line of readFileSync(join(here, 'stack', 'values.env'), 'utf8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) values[match[1]] = match[2];
  }
  return values;
}

// Ergänzungen zum erzeugten Stack: Name und Anschrift der Demo-Organisation, Handbuch-Button
function overrideCompose(edition) {
  const { backendService } = EDITIONS[edition];
  const marktUi =
    edition === 'enterprise'
      ? `
  markt-ui:
    environment:
      MARKT_DOCS_BASE_URL: "${DOCS_BASE_URL}"`
      : '';
  return `# Erzeugt von documentation/scripts/screenshots/stack.mjs
services:
  ${backendService}:
    environment:
      AppSettings__InitialOrganisationName: "Demo Pumpen GmbH"
      AppSettings__InitialOrganisationStrasse: "Musterstraße 1"
      AppSettings__InitialOrganisationPlz: "12345"
      AppSettings__InitialOrganisationOrt: "Musterstadt"
      AppSettings__InitialOrganisationEmail: "info@demo-pumpen.example"
  frontend:
    environment:
      FRONTEND_DOCS_BASE_URL: "${DOCS_BASE_URL}"${marktUi}
`;
}

function composeArgs(edition) {
  const dir = stackDir(edition);
  return [
    'compose',
    '-p',
    projectName(edition),
    '--env-file',
    join(dir, 'stack', '.env'),
    '-f',
    join(dir, 'stack', 'docker-compose.yml'),
    '-f',
    join(dir, 'docker-compose.handbuch.yml'),
  ];
}

async function waitFor(url, label, timeoutMs = 10 * 60 * 1000) {
  const start = Date.now();
  let lastError = '';
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.status < 500) {
        console.log(`${label} erreichbar (${response.status})`);
        return;
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.cause?.code || error.message;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error(`${label} nicht erreichbar nach ${timeoutMs / 1000} s: ${url} (${lastError})`);
}

export async function up(edition, { skipBuild = false } = {}) {
  const config = EDITIONS[edition];
  await down(edition, { quiet: true });

  if (!skipBuild) {
    run('bash', [config.build], { env: { ...process.env, IMAGE_TAG } });
  }

  const dir = stackDir(edition);
  mkdirSync(dir, { recursive: true });
  const ports = {};
  for (const key of PORT_KEYS) ports[key] = String(await freePort());
  const baseUrl = `http://localhost:${ports.GATEWAY_HOST_PORT}`;

  const overrides = {
    PROJECT_NAME: projectName(edition),
    NETWORK_NAME: `${projectName(edition)}-net`,
    BASE_URL: baseUrl,
    PUBLIC_GATEWAY_URL: baseUrl,
    RUN_STACK_START: 'no',
    ...ports,
  };
  for (const key of config.imageKeys) overrides[`${key}_IMAGE_TAG`] = IMAGE_TAG;

  run('bash', [
    config.wizard,
    '--state-file',
    join(dir, 'wizard-state.env'),
    '--input',
    join(here, 'stack', 'values.env'),
    '--image-source',
    'local',
    '--output-dir',
    join(dir, 'stack'),
    '--run-stack-start',
    'no',
    ...Object.entries(overrides).map(([key, value]) => `${key}=${value}`),
  ]);
  writeFileSync(join(dir, 'docker-compose.handbuch.yml'), overrideCompose(edition));
  if (edition === 'enterprise' && !existsSync(LICENSE_FILE)) {
    throw new Error(
      `Test-Lizenz fehlt: ${LICENSE_FILE}. Ohne Lizenz zeigt jedes Enterprise-Bild einen Lizenzhinweis; ` +
        'Pfad über HANDBUCH_LICENSE_FILE angeben.',
    );
  }

  run('docker', [...composeArgs(edition), 'up', '-d']);

  const values = readValues();
  const info = {
    edition,
    baseUrl,
    // Enterprise liefert den Designer unter /designer-ui/ aus, Community (OSS) direkt unter /
    designerUrl: edition === 'enterprise' ? `${baseUrl}/designer-ui/` : `${baseUrl}/`,
    marktUrl: edition === 'enterprise' ? `${baseUrl}/markt-ui/` : null,
    // Der Designer speichert die Lizenz in der Datenbank; der Seed lädt sie über die Systemverwaltung hoch
    licenseFile: edition === 'enterprise' ? LICENSE_FILE : null,
    account: {
      email: values.INITIAL_ORGANISATION_ADMIN_EMAIL,
      password: values.INITIAL_ORGANISATION_ADMIN_PASSWORD,
    },
  };
  writeFileSync(stackInfoFile(edition), JSON.stringify(info, null, 2));

  await waitFor(`${baseUrl}/health`, 'Gateway');
  await waitFor(info.designerUrl, 'Designer');
  await waitFor(`${baseUrl}/realms/aas-local/.well-known/openid-configuration`, 'Keycloak');
  console.log(`Stack läuft: ${info.designerUrl}`);
  return info;
}

export async function down(edition, { quiet = false } = {}) {
  const dir = stackDir(edition);
  if (existsSync(join(dir, 'stack', 'docker-compose.yml'))) {
    run('docker', [...composeArgs(edition), 'down', '-v', '--remove-orphans']);
  } else if (!quiet) {
    console.log(`Kein Stack für ${edition} gefunden.`);
  }
  rmSync(dir, { recursive: true, force: true });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command = 'up', ...rest] = process.argv.slice(2);
  const editionIndex = rest.indexOf('--edition');
  const edition = editionIndex >= 0 ? rest[editionIndex + 1] : 'enterprise';
  if (!EDITIONS[edition]) throw new Error(`Unbekannte Edition: ${edition}`);
  const skipBuild = rest.includes('--skip-build') || process.env.HANDBUCH_SKIP_BUILD === '1';
  if (command === 'up') await up(edition, { skipBuild });
  else if (command === 'down') await down(edition);
  else throw new Error(`Unbekannter Befehl: ${command} (up|down)`);
}
