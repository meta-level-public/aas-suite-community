// Angaben zum laufenden Wegwerf-Stack (geschrieben von stack.mjs) und gemeinsame Pfade.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const screenshotsDir = join(dirname(fileURLToPath(import.meta.url)), '..');

export const EDITION = process.env.HANDBUCH_EDITION === 'oss' ? 'oss' : 'enterprise';
export const IMG_DIR = join(screenshotsDir, '..', '..', 'static', 'img');

export function readStackInfo(edition = EDITION) {
  const dir = join(screenshotsDir, '.stack', edition);
  const file = join(dir, 'stack.json');
  if (!existsSync(file)) {
    throw new Error(
      `Kein laufender Stack (${file} fehlt). Bitte \`npm run screenshots\` verwenden oder ` +
        `\`node scripts/screenshots/stack.mjs up --edition ${edition}\` starten.`,
    );
  }
  return { ...JSON.parse(readFileSync(file, 'utf8')), authFile: join(dir, 'auth.json'), dir };
}
