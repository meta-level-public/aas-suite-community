#!/usr/bin/env node
// Prüft, dass jede im Frontend über docsTopic('...') referenzierte Handbuchseite existiert.
// Bei Verweisen mit Anker ('seite#abschnitt') muss die Seite auch diese Überschrift enthalten.
// Aufruf: npm run check:topics (aus documentation/)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(docsRoot, 'docs');
const frontendRoots = ['apps', 'libs'].map((dir) => join(docsRoot, '..', 'frontend', dir));
const skipDirs = new Set(['node_modules', 'dist', 'coverage', '.angular', '.nx']);
const topicPattern = /docsTopic\(\s*'([^']*)'\s*\)/g;

function* sourceFiles(dir) {
  for (const entry of readdirSync(dir)) {
    if (skipDirs.has(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      yield* sourceFiles(path);
    } else if (entry.endsWith('.ts') && !entry.endsWith('.spec.ts')) {
      yield path;
    }
  }
}

function pageFile(page) {
  const base = join(docsDir, page);
  const candidates = page === '' ? [join(docsDir, 'index.md')] : [];
  for (const ext of ['.md', '.mdx']) {
    candidates.push(base + ext, join(base, 'index' + ext));
  }
  return candidates.find((candidate) => existsSync(candidate));
}

// Anker wie Docusaurus: explizit über {#id}, sonst aus dem Überschriftentext (github-slugger)
function headingAnchors(file) {
  const anchors = new Set();
  for (const [, text] of readFileSync(file, 'utf8').matchAll(/^#{2,6}\s+(.+?)\s*$/gm)) {
    const explicit = text.match(/\{#([^}]+)\}$/);
    if (explicit) {
      anchors.add(explicit[1]);
      continue;
    }
    const plain = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '');
    anchors.add(plain.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-'));
  }
  return anchors;
}

function topicExists(topic) {
  const [page, anchor] = topic.split('#');
  const file = pageFile(page);
  return file != null && (anchor == null || headingAnchors(file).has(anchor));
}

const missing = [];
let count = 0;
for (const root of frontendRoots.filter((dir) => existsSync(dir))) {
  for (const file of sourceFiles(root)) {
    for (const match of readFileSync(file, 'utf8').matchAll(topicPattern)) {
      count++;
      if (!topicExists(match[1])) {
        missing.push(`${relative(join(docsRoot, '..'), file)}: docsTopic('${match[1]}')`);
      }
    }
  }
}

if (missing.length > 0) {
  console.error('Handbuchseiten nicht gefunden:\n  ' + missing.join('\n  '));
  process.exit(1);
}
console.log(`${count} Verweise auf Handbuchseiten geprüft, alle vorhanden.`);
