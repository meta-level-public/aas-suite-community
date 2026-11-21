#!/usr/bin/env node
// Prüft die Verbindung zwischen Frontend und Handbuch (Kontexthilfe):
//   1. Jede Seite und jeder Anker in DOCS_TARGETS (frontend/libs/common-services/src/lib/docs-targets.ts)
//      existiert im Handbuch. DOCS_TARGETS ist die typisierte Liste aller Ziele; docsTopic() akzeptiert nur sie.
//   2. Jeder Aufruf docsTopic('<seite>'[, '<anker>']) im Frontend nennt ein Ziel aus dieser Liste
//      (doppelt zur TypeScript-Prüfung, damit auch nicht gebaute Projekte erfasst sind).
// Im Community-Repository (OSS-Export) fehlen die Enterprise-Seiten (markt/, betrieb/enterprise/); Ziele dort
// werden dann übersprungen.
// Aufruf: npm run check:topics (aus documentation/)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(docsRoot, '..');
const docsDir = join(docsRoot, 'docs');
const targetsFile = join(repoRoot, 'frontend', 'libs', 'common-services', 'src', 'lib', 'docs-targets.ts');
const frontendRoots = ['apps', 'libs'].map((dir) => join(repoRoot, 'frontend', dir));
const skipDirs = new Set(['node_modules', 'dist', 'coverage', '.angular', '.nx']);
const ENTERPRISE_ONLY = [/^markt(\/|$)/, /^betrieb\/enterprise(\/|$)/];
const hasEnterprisePages = existsSync(join(docsDir, 'markt'));

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
  const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const [, heading] of text.matchAll(/^#{2,6}\s+(.+?)\s*$/gm)) {
    const explicit = heading.match(/\{#([^}]+)\}$/);
    if (explicit) {
      anchors.add(explicit[1]);
      continue;
    }
    const plain = heading.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '');
    anchors.add(plain.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-'));
  }
  return anchors;
}

// DOCS_TARGETS aus der TypeScript-Datei lesen: '<seite>': ['<anker>', ...]
function readTargets() {
  const source = readFileSync(targetsFile, 'utf8');
  const body = source.slice(source.indexOf('DOCS_TARGETS = {'), source.indexOf('} as const'));
  const targets = new Map();
  for (const [, quoted, bare, anchors] of body.matchAll(/(?:'([^']*)'|([\w-]+))\s*:\s*\[([^\]]*)\]/g)) {
    targets.set(quoted ?? bare, [...anchors.matchAll(/'([^']+)'/g)].map((match) => match[1]));
  }
  if (targets.size === 0) throw new Error(`Keine Ziele in ${relative(repoRoot, targetsFile)} gefunden.`);
  return targets;
}

const errors = [];
const skipped = [];
const targets = readTargets();
let anchorCount = 0;
for (const [page, anchors] of targets) {
  const file = pageFile(page);
  if (file == null) {
    if (!hasEnterprisePages && ENTERPRISE_ONLY.some((pattern) => pattern.test(page))) {
      skipped.push(page);
      continue;
    }
    errors.push(`DOCS_TARGETS: Seite '${page}' gibt es nicht unter documentation/docs/`);
    continue;
  }
  const existing = headingAnchors(file);
  for (const anchor of anchors) {
    anchorCount++;
    if (!existing.has(anchor)) {
      errors.push(`DOCS_TARGETS: Anker '${anchor}' fehlt in ${relative(docsRoot, file)} (Überschrift umbenannt?)`);
    }
  }
}

// docsTopic('<seite>') bzw. docsTopic('<seite>', '<anker>') mit Literalen
const callPattern = /docsTopic\(\s*'([^']*)'\s*(?:,\s*'([^']*)'\s*)?\)/g;
let callCount = 0;
for (const root of frontendRoots.filter((dir) => existsSync(dir))) {
  for (const file of sourceFiles(root)) {
    if (file === targetsFile) continue;
    for (const [, page, anchor] of readFileSync(file, 'utf8').matchAll(callPattern)) {
      callCount++;
      const where = `${relative(repoRoot, file)}: docsTopic('${page}'${anchor ? `, '${anchor}'` : ''})`;
      if (!targets.has(page)) errors.push(`${where}: Seite fehlt in DOCS_TARGETS`);
      else if (anchor && !targets.get(page).includes(anchor)) errors.push(`${where}: Anker fehlt in DOCS_TARGETS`);
    }
  }
}

if (errors.length > 0) {
  console.error('Kontexthilfe und Handbuch passen nicht zusammen:\n  ' + errors.join('\n  '));
  process.exit(1);
}
if (skipped.length > 0) console.warn(`Enterprise-Seiten übersprungen (nicht in diesem Handbuch): ${skipped.join(', ')}`);
console.log(
  `${targets.size} Seiten und ${anchorCount} Anker aus DOCS_TARGETS geprüft, ${callCount} docsTopic-Aufrufe passen dazu.`,
);
