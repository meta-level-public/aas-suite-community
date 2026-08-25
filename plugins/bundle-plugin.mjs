#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { constants } from 'node:fs';
import { access, cp, mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const requiredText = '(required)';
const useDefaults = process.argv.includes('--defaults');

const rl = createInterface({ input, output });

try {
  console.log('AAS Suite GUI Plugin Bundler');
  console.log('This script creates a backend-ready plugin ZIP with manifest.json at the archive root.');
  if (useDefaults) {
    console.log('Using default values because --defaults was provided.');
  }

  const sourceDirectoryInput = await ask('Plugin source directory', 'hello-world-demo');
  const sourceDirectory = resolveFromScriptDirectory(sourceDirectoryInput);
  const defaults = defaultsFromSourceDirectory(sourceDirectory);

  if (await askBoolean('Run plugin build command before bundling?', false)) {
    const packageManager = await ask('Package manager command', detectPackageManager(sourceDirectory));
    const buildCommand = await ask('Build script', 'build');
    runBuild(sourceDirectory, packageManager, buildCommand);
  }

  const buildDirectoryDefault = await resolveDefaultBuildDirectory(sourceDirectory);
  const buildDirectoryInput = await ask('Compiled frontend directory', buildDirectoryDefault);
  const buildDirectory = resolveFromCurrentOrScriptDirectory(buildDirectoryInput);
  await ensureDirectory(buildDirectory, 'Compiled frontend directory');

  const manifest = {
    manifestVersion: 1,
    id: await askRequired(`Plugin id ${requiredText}`, defaults.id),
    route: await askRequired(`Plugin route ${requiredText}`, defaults.route),
    name: await askRequired(`Menu name ${requiredText}`, defaults.name),
    icon: await askRequired(`PrimeIcon class ${requiredText}`, defaults.icon),
    entryPoint: await askRequired(`Entry point ${requiredText}`, defaults.entryPoint),
  };

  const optionalValues = {
    description: await ask('Description', defaults.description),
    shortLabel: await ask('Short label', defaults.shortLabel),
    requiredRole: await ask('Required role', defaults.requiredRole),
    requiresWritableRepo: await ask('Requires writable repository', defaults.requiresWritableRepo),
    sortOrder: await ask('Sort order', defaults.sortOrder),
    version: await ask('Version', defaults.version),
    author: await ask('Author', defaults.author),
  };

  const fullManifest = addOptionalManifestFields(manifest, optionalValues);
  fullManifest.route = normalizeRoute(fullManifest.route);
  validateManifest(fullManifest);

  const entryPointPath = join(buildDirectory, fullManifest.entryPoint);
  await ensureFile(entryPointPath, `Entry point ${fullManifest.entryPoint}`);

  const outputZipDefault = join(scriptDirectory, `${fullManifest.id}.zip`);
  const outputZipInput = await ask('Output ZIP path', outputZipDefault);
  const outputZip = resolveFromCurrentOrScriptDirectory(outputZipInput);

  await createPluginZip(buildDirectory, fullManifest, outputZip);
  console.log(`Created plugin ZIP: ${outputZip}`);
} finally {
  rl.close();
}

async function ask(question, defaultValue) {
  if (useDefaults) {
    console.log(`${question}: ${defaultValue}`);
    return defaultValue;
  }

  const suffix = defaultValue === '' ? '' : ` [${defaultValue}]`;
  const answer = await rl.question(`${question}${suffix}: `);
  return answer.trim() === '' ? defaultValue : answer.trim();
}

async function askRequired(question, defaultValue) {
  while (true) {
    const answer = await ask(question, defaultValue);
    if (answer.trim() !== '') {
      return answer.trim();
    }
    console.log('Please enter a value.');
  }
}

async function askBoolean(question, defaultValue) {
  if (useDefaults) {
    console.log(`${question}: ${defaultValue ? 'yes' : 'no'}`);
    return defaultValue;
  }

  const defaultText = defaultValue ? 'Y/n' : 'y/N';
  const answer = (await rl.question(`${question} [${defaultText}]: `)).trim().toLowerCase();
  if (answer === '') {
    return defaultValue;
  }
  return answer === 'y' || answer === 'yes' || answer === 'j' || answer === 'ja';
}

function resolveFromScriptDirectory(path) {
  return isAbsolute(path) ? path : resolve(scriptDirectory, path);
}

function resolveFromCurrentOrScriptDirectory(path) {
  return isAbsolute(path) ? path : resolve(process.cwd(), path);
}

async function resolveDefaultBuildDirectory(sourceDirectory) {
  // Static plugins (no build step) ship index.html directly in the source directory.
  if (await hasIndexHtml(sourceDirectory)) {
    return sourceDirectory;
  }

  const pluginId = basename(sourceDirectory);
  const candidates = [
    join(sourceDirectory, 'dist', pluginId, 'browser'),
    join(sourceDirectory, 'dist', pluginId),
    join(sourceDirectory, 'dist'),
  ];

  for (const candidate of candidates) {
    if (await hasIndexHtml(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

async function hasIndexHtml(directory) {
  try {
    const result = await stat(join(directory, 'index.html'));
    return result.isFile();
  } catch {
    return false;
  }
}

function detectPackageManager(sourceDirectory) {
  try {
    const result = spawnSync('test', ['-f', join(sourceDirectory, 'pnpm-lock.yaml')]);
    if (result.status === 0) {
      return 'pnpm';
    }
  } catch {
    // Fall back to pnpm.
  }
  return 'pnpm';
}

function defaultsFromSourceDirectory(sourceDirectory) {
  const id = basename(sourceDirectory).toLowerCase();
  const name = id
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const shortLabel = id.replace(/-/g, ' ').toUpperCase().slice(0, 12);

  return {
    id,
    route: `/${id}`,
    name,
    icon: 'pi pi-box',
    entryPoint: 'index.html',
    description: `${name} plugin.`,
    shortLabel,
    requiredRole: '',
    requiresWritableRepo: 'false',
    sortOrder: '100',
    version: '1.0.0',
    author: 'Meta Level Software AG',
  };
}

function runBuild(sourceDirectory, packageManager, buildCommand) {
  const result = spawnSync(packageManager, ['run', buildCommand], {
    cwd: sourceDirectory,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`Build command failed with exit code ${result.status ?? 'unknown'}.`);
  }
}

function addOptionalManifestFields(manifest, optionalValues) {
  const result = { ...manifest };

  for (const [key, value] of Object.entries(optionalValues)) {
    if (value === '') {
      continue;
    }

    if (key === 'requiresWritableRepo') {
      result[key] = value.toLowerCase() === 'true';
    } else if (key === 'sortOrder') {
      result[key] = Number.parseInt(value, 10);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function normalizeRoute(route) {
  const trimmed = route.trim();
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function validateManifest(manifest) {
  const idRegex = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/i;
  const routeRegex = /^\/[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/i;

  if (!idRegex.test(manifest.id)) {
    throw new Error('Plugin id must be URL-safe, for example hello-world-demo.');
  }
  if (!routeRegex.test(manifest.route)) {
    throw new Error('Plugin route must be a top-level route, for example /hello-world-demo.');
  }
  if (!manifest.icon.startsWith('pi pi-')) {
    throw new Error('Icon must be a PrimeIcons class starting with pi pi-.');
  }
  if (Number.isNaN(manifest.sortOrder)) {
    throw new Error('Sort order must be a number.');
  }
}

async function ensureDirectory(path, label) {
  const result = await stat(path);
  if (!result.isDirectory()) {
    throw new Error(`${label} is not a directory: ${path}`);
  }
}

async function ensureFile(path, label) {
  await access(path, constants.R_OK).catch(() => {
    throw new Error(`${label} does not exist or is not readable: ${path}`);
  });
}

async function createPluginZip(buildDirectory, manifest, outputZip) {
  const stagingDirectory = await mkdtemp(join(tmpdir(), 'aas-plugin-'));
  try {
    await cp(buildDirectory, stagingDirectory, { recursive: true });
    await writeFile(join(stagingDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    await rm(outputZip, { force: true });

    const result = spawnSync('zip', ['-qr', outputZip, '.'], {
      cwd: stagingDirectory,
      stdio: 'inherit',
    });

    if (result.error != null) {
      throw result.error;
    }
    if (result.status !== 0) {
      throw new Error(`zip failed with exit code ${result.status ?? 'unknown'}.`);
    }
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true });
  }
}