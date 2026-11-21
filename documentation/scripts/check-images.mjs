#!/usr/bin/env node
// Prüft die Handbuchbilder unter static/img/ gegen Kapitel und Aufnahmen (scripts/screenshots/specs/):
//   - jedes in einem Kapitel eingebundene Bild wird von einer Aufnahme erzeugt (shot(page, '<bereich>/<thema>')),
//   - jedes erzeugte Bild ist in mindestens einem Kapitel eingebunden,
//   - unter static/img/ liegt kein Bild, das weder eingebunden noch erzeugt wird.
// Aufnahmen in Specs mit test.fixme() zählen als zurückgestellt und werden nur gemeldet.
// Aufruf: npm run check:images (aus documentation/)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'docs');
const imgDir = join(root, 'static', 'img');
const specsDir = join(root, 'scripts', 'screenshots', 'specs');
// Bilder, die nicht aus der Anwendung stammen (Logo, Grafiken)
const STATIC_IMAGES = new Set(['logo.svg']);

function* files(dir, ext) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* files(path, ext);
    else if (ext.some((e) => entry.endsWith(e))) yield path;
  }
}

// Eingebundene Bilder: ![Alt](/img/...) in Markdown, ohne Code (Beispiele in mitwirken/)
const embedded = new Map();
for (const file of files(docsDir, ['.md', '.mdx'])) {
  const text = readFileSync(file, 'utf8')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]*`/g, '');
  for (const [, path] of text.matchAll(/!\[[^\]]*\]\(\/img\/([^)\s]+)\)/g)) {
    if (!embedded.has(path)) embedded.set(path, []);
    embedded.get(path).push(relative(root, file));
  }
}

// Erzeugte Bilder: shot(<seite>, '<bereich>/<thema>'
const produced = new Map();
const deferred = new Map();
for (const file of files(specsDir, ['.mjs'])) {
  const text = readFileSync(file, 'utf8');
  const target = /test\.fixme\(\)/.test(text) ? deferred : produced;
  for (const [, name] of text.matchAll(/shot\(\s*[\w.]+\s*,\s*'([^']+)'/g)) {
    target.set(`${name}.png`, relative(root, file));
  }
}

const errors = [];
for (const [path, pages] of embedded) {
  if (STATIC_IMAGES.has(path) || produced.has(path)) continue;
  if (deferred.has(path)) errors.push(`${path}: eingebunden in ${pages.join(', ')}, Aufnahme ist zurückgestellt (${deferred.get(path)})`);
  else errors.push(`${path}: eingebunden in ${pages.join(', ')}, aber von keiner Aufnahme erzeugt`);
  if (!existsSync(join(imgDir, path))) errors.push(`${path}: Datei fehlt unter static/img/`);
}
for (const [path, spec] of produced) {
  if (!embedded.has(path)) errors.push(`${path}: erzeugt in ${spec}, aber in keinem Kapitel eingebunden`);
}
for (const file of files(imgDir, ['.png', '.jpg', '.svg', '.gif'])) {
  const path = relative(imgDir, file);
  if (!embedded.has(path) && !produced.has(path) && !STATIC_IMAGES.has(path)) {
    errors.push(`${path}: liegt unter static/img/, wird aber weder eingebunden noch erzeugt`);
  }
}

for (const [path, spec] of deferred) {
  if (!embedded.has(path)) console.warn(`Zurückgestellt: ${path} (${spec})`);
}
if (errors.length > 0) {
  console.error('Bilder passen nicht zu Kapiteln und Aufnahmen:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log(`${embedded.size} eingebundene Bilder geprüft, alle werden von ${produced.size} Aufnahmen erzeugt.`);
