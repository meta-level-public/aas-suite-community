#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { constants } from 'node:fs';
import { access, cp, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const requiredText = '(required)';
const useDefaults = process.argv.includes('--defaults');
const sourceArgumentIndex = process.argv.indexOf('--source');
const sourceArgument = sourceArgumentIndex >= 0 ? process.argv[sourceArgumentIndex + 1] : null;

const rl = createInterface({ input, output });

try {
  const defaults = {
    sourceDirectory: 'hello-world-demo',
    id: 'hello-world-demo',
    route: '/hello-world-demo',
    name: 'Hello World Demo',
    icon: 'pi pi-question-circle',
    entryPoint: 'index.html',
    description: 'A minimal Angular plugin running inside the AAS Suite plugin host.',
    shortLabel: 'HELLO',
    requiredRole: '',
    requiresWritableRepo: 'false',
    sortOrder: '100',
    version: '1.0.0',
    author: 'Meta Level Software AG',
  };

  console.log('AAS Suite Plugin Bundler');
  console.log('This script creates a backend-ready plugin ZIP with manifest.json at the archive root.');
  if (useDefaults) {
    console.log('Using default values because --defaults was provided.');
  }

  const sourceDirectoryInput = await ask('Plugin source directory', sourceArgument ?? defaults.sourceDirectory);
  const sourceDirectory = resolveFromScriptDirectory(sourceDirectoryInput);
  const sourceManifest = await readManifest(sourceDirectory);
  const pluginDefaults = { ...defaults, ...sourceManifest };

  if (await askBoolean('Run plugin build command before bundling?', false)) {
    const packageManager = await ask('Package manager command', detectPackageManager(sourceDirectory));
    const buildCommand = await ask('Build script', 'build');
    runBuild(sourceDirectory, packageManager, buildCommand);
  }

  const buildDirectoryDefault = await resolveDefaultBuildDirectory(sourceDirectory, pluginDefaults.id);
  const buildDirectoryInput = await ask('Compiled frontend directory', buildDirectoryDefault);
  const buildDirectory = resolveFromCurrentOrScriptDirectory(buildDirectoryInput);
  await ensureDirectory(buildDirectory, 'Compiled frontend directory');

  const backendDirectoryDefault = join(sourceDirectory, 'backend');
  const includeBackend = await askBoolean(
    'Include a .NET backend plugin?',
    (await findProjectFile(backendDirectoryDefault)) != null,
  );
  let backendOptions = null;
  if (includeBackend) {
    const backendProjectDirectoryInput = await ask('Backend project directory', backendDirectoryDefault);
    const backendProjectDirectory = resolveFromCurrentOrScriptDirectory(backendProjectDirectoryInput);
    await ensureDirectory(backendProjectDirectory, 'Backend project directory');
    const backendProjectFile = await findProjectFile(backendProjectDirectory);
    if (backendProjectFile == null) {
      throw new Error(`No .csproj file found in backend project directory: ${backendProjectDirectory}`);
    }

    const backendAssemblyDefault = pluginDefaults.backend?.assembly?.split('/').pop()
      ?? `${backendProjectFile.name.replace(/\.csproj$/i, '')}.dll`;
    const backendAssembly = await ask('Backend assembly filename', backendAssemblyDefault);
    const backendType = await askRequired(
      `Backend plugin type ${requiredText}`,
      pluginDefaults.backend?.type ?? 'HelloWorldBackendPlugin.HelloWorldBackendPlugin',
    );
    const backendOutputDirectoryInput = await ask(
      'Backend build output directory',
      join(backendProjectDirectory, 'bin', 'Release', 'net10.0'),
    );
    const backendOutputDirectory = resolveFromCurrentOrScriptDirectory(backendOutputDirectoryInput);
    runDotnetBuild(backendProjectFile.path, backendProjectDirectory);
    await ensureFile(join(backendOutputDirectory, backendAssembly), `Backend assembly ${backendAssembly}`);
    backendOptions = { backendOutputDirectory, backendAssembly, backendType };
  }

  const manifest = {
    manifestVersion: 1,
    id: await askRequired(`Plugin id ${requiredText}`, pluginDefaults.id),
    route: await askRequired(`Plugin route ${requiredText}`, pluginDefaults.route),
    name: await askRequired(`Menu name ${requiredText}`, pluginDefaults.name),
    icon: await askRequired(`PrimeIcon class ${requiredText}`, pluginDefaults.icon),
    entryPoint: await askRequired(`Entry point ${requiredText}`, pluginDefaults.entryPoint),
  };

  const optionalValues = {
    description: await ask('Description', pluginDefaults.description),
    shortLabel: await ask('Short label', pluginDefaults.shortLabel),
    requiredRole: await ask('Required role', pluginDefaults.requiredRole),
    requiresWritableRepo: await ask('Requires writable repository', String(pluginDefaults.requiresWritableRepo ?? 'false')),
    sortOrder: await ask('Sort order', String(pluginDefaults.sortOrder ?? '100')),
    version: await ask('Version', String(pluginDefaults.version ?? '')),
    author: await ask('Author', String(pluginDefaults.author ?? '')),
  };

  const fullManifest = addOptionalManifestFields(manifest, optionalValues);
  if (backendOptions != null) {
    fullManifest.backend = {
      assembly: `backend/${backendOptions.backendAssembly}`,
      type: backendOptions.backendType,
    };
  }
  validateManifest(fullManifest);

  const entryPointPath = join(buildDirectory, fullManifest.entryPoint);
  await ensureFile(entryPointPath, `Entry point ${fullManifest.entryPoint}`);

  const outputZipDefault = join(scriptDirectory, `${fullManifest.id}.zip`);
  const outputZipInput = await ask('Output ZIP path', outputZipDefault);
  const outputZip = resolveFromCurrentOrScriptDirectory(outputZipInput);

  await createPluginZip(buildDirectory, fullManifest, outputZip, backendOptions);
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

async function readManifest(sourceDirectory) {
  try {
    const content = await readFile(join(sourceDirectory, 'manifest.json'), 'utf8');
    return JSON.parse(content);
  } catch {
    return {};
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

async function resolveDefaultBuildDirectory(sourceDirectory, pluginId) {
  const candidates = [
    join(sourceDirectory, 'dist', pluginId, 'browser'),
    join(sourceDirectory, 'dist', pluginId),
    join(sourceDirectory, 'dist'),
  ];

  for (const candidate of candidates) {
    try {
      const result = await stat(candidate);
      if (result.isDirectory()) {
        return candidate;
      }
    } catch {
      // Try the next candidate.
    }
  }

  return candidates[0];
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

async function findProjectFile(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return null;
  }
  const project = entries.find((entry) => entry.isFile() && entry.name.endsWith('.csproj'));
  return project == null ? null : { name: project.name, path: join(directory, project.name) };
}

function runDotnetBuild(projectFile, workingDirectory) {
  const result = spawnSync('dotnet', ['build', projectFile, '--configuration', 'Release'], {
    cwd: workingDirectory,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(`dotnet build failed with exit code ${result.status ?? 'unknown'}.`);
  }
}

async function ensureFile(path, label) {
  await access(path, constants.R_OK).catch(() => {
    throw new Error(`${label} does not exist or is not readable: ${path}`);
  });
}

async function createPluginZip(buildDirectory, manifest, outputZip, backendOptions) {
  const stagingDirectory = await mkdtemp(join(tmpdir(), 'aas-plugin-'));
  try {
    await cp(buildDirectory, stagingDirectory, { recursive: true });
    if (backendOptions != null) {
      await cp(backendOptions.backendOutputDirectory, join(stagingDirectory, 'backend'), { recursive: true });
    }
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