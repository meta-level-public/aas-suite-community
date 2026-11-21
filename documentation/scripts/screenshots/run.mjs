#!/usr/bin/env node
// Ein Befehl für alle Handbuch-Aufnahmen: Wegwerf-Stack hochfahren → anmelden und Demo-Daten anlegen →
// Aufnahmen → Stack samt Volumes abräumen.
//
//   npm run screenshots                      Enterprise (alle Bilder)
//   npm run screenshots:oss                  Community/OSS (ohne Enterprise-Bilder)
//   npm run screenshots:headed               mit sichtbarem Browser
//   npm run screenshots -- aas-verwalten     nur passende Specs (weitere Playwright-Argumente möglich)
//
// HANDBUCH_KEEP_STACK=1 lässt den Stack nach dem Lauf stehen (zum Nachbessern einzelner Aufnahmen mit
// `npx playwright test -c scripts/screenshots/playwright.config.mjs ...`); HANDBUCH_SKIP_BUILD=1 baut
// die Images nicht neu.
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { down, up } from './stack.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const edition = args.includes('--oss') ? 'oss' : 'enterprise';
const playwrightArgs = args.filter((arg) => arg !== '--oss');
const keep = process.env.HANDBUCH_KEEP_STACK === '1';

let status = 1;
try {
  await up(edition, { skipBuild: process.env.HANDBUCH_SKIP_BUILD === '1' });
  const result = spawnSync(
    'npx',
    ['playwright', 'test', '-c', join(here, 'playwright.config.mjs'), ...playwrightArgs],
    { stdio: 'inherit', cwd: join(here, '..', '..'), env: { ...process.env, HANDBUCH_EDITION: edition } },
  );
  status = result.status ?? 1;
} finally {
  if (keep) console.log('HANDBUCH_KEEP_STACK=1: Stack bleibt stehen. Abräumen mit `node scripts/screenshots/stack.mjs down`.');
  else await down(edition);
}
process.exit(status);
