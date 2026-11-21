#!/usr/bin/env node
// Prüft das Frontmatter "quellen" aller Kapitel: Jeder Eintrag ist ein repo-relativer Pfad, der existiert.
// "quellen" verbindet Kapitel und Code: Bei einer Code-Änderung findet `grep -rl <pfad> documentation/docs`
// die betroffenen Kapitel. Ein umbenannter oder gelöschter Pfad lässt diese Prüfung scheitern.
// Im Community-Repository (OSS-Export, ohne tools/oss-export/) fehlen Enterprise-Pfade; dort gibt es nur Warnungen.
// Aufruf: npm run check:quellen (aus documentation/, braucht das ganze Repository)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(root, '..');
const docsDir = join(root, 'docs');

function* files(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (/\.mdx?$/.test(entry)) yield path;
  }
}

const errors = [];
let count = 0;
for (const file of files(docsDir)) {
  const match = /^---\n([\s\S]*?)\n---/.exec(readFileSync(file, 'utf8'));
  if (!match) continue;
  const quellen = yaml.load(match[1])?.quellen;
  if (quellen === undefined) continue;
  const page = relative(root, file);
  if (!Array.isArray(quellen)) {
    errors.push(`${page}: "quellen" muss eine Liste von Pfaden sein`);
    continue;
  }
  for (const path of quellen) {
    count++;
    if (typeof path !== 'string' || path.startsWith('/') || !existsSync(join(repoRoot, path))) {
      errors.push(`${page}: Quelle "${path}" existiert nicht (Pfad relativ zum Repository angeben)`);
    }
  }
}

const isEnterpriseRepo = existsSync(join(repoRoot, 'tools', 'oss-export'));
if (errors.length > 0 && !isEnterpriseRepo) {
  console.warn('Quellen fehlen in diesem Repository (Enterprise-Pfade):\n  ' + errors.join('\n  '));
} else if (errors.length > 0) {
  console.error('Quellen der Kapitel stimmen nicht:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log(`${count} Quellen geprüft${errors.length > 0 ? `, ${errors.length} fehlen` : ', alle vorhanden'}.`);
