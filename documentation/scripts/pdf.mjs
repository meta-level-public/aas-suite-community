#!/usr/bin/env node
// Druckt das gebaute Handbuch zu einem einzigen PDF (je Edition eins):
//   Deckblatt mit Edition und Stand (Datum, Commit) → Inhaltsverzeichnis mit Seitenzahlen → alle Kapitel in der
//   Reihenfolge der Seitenleiste → Stichwortverzeichnis (letzte Seite der Seitenleiste).
// Verweise zwischen Kapiteln werden zu Sprüngen im PDF, Lesezeichen entstehen aus den Überschriften. Screenshots
// werden auf Druckgröße verkleinert (1400 px bei 170 mm Satzbreite, gut 200 dpi). Videos, die Seite „Videos“ und
// der Satz, der auf ein Video hinführt („Das Video zeigt …“), fehlen im PDF.
//
// Aufruf (nach dem Build):  npm run pdf            → build/handbuch.pdf
//                           npm run pdf:oss        → build-oss/handbuch.pdf
//   node scripts/pdf.mjs --build-dir <dir> [--out <datei>]
// Seitenumbruch und Seitenzahlen übernimmt Paged.js im Browser, gedruckt wird mit Chromium (Playwright).
// Stand: DOCS_COMMIT bzw. GITHUB_SHA, sonst `git rev-parse`. HANDBUCH_CHROMIUM: Pfad zu einem vorhandenen Chromium.
import { execFileSync } from 'node:child_process';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// Paged.js exportiert seine Browser-Datei nicht über "exports", daher der Pfad im Paket
const PAGED_JS = join(root, 'node_modules', 'pagedjs', 'dist', 'paged.js');
const SKELETON_PATH = '/__handbuch-pdf__.html';
const IMAGE_WIDTH = 1400;
const VIDEO_PAGES = new Set(['/videos']);

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const buildDir = resolve(argument('--build-dir', join(root, 'build')));
const outFile = resolve(argument('--out', join(buildDir, 'handbuch.pdf')));
const pagesFile = join(buildDir, 'pdf-seiten.json');
if (!existsSync(pagesFile)) {
  console.error(`${pagesFile} fehlt. Zuerst das Handbuch bauen (npm run build bzw. npm run build:oss).`);
  process.exit(1);
}
const { edition, seiten } = JSON.parse(readFileSync(pagesFile, 'utf8'));

function commit() {
  const fromEnv = process.env.DOCS_COMMIT || process.env.GITHUB_SHA;
  if (fromEnv) return fromEnv.slice(0, 8);
  try {
    return execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return 'unbekannt';
  }
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

// Kleiner Webserver für das Build-Verzeichnis (absolute Pfade wie /img/... müssen auflösen)
const server = createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? '/').split(/[?#]/)[0]);
  if (path === SKELETON_PATH) {
    res.writeHead(200, { 'Content-Type': TYPES['.html'] });
    res.end('<!doctype html><html lang="de"><head><meta charset="utf-8"><title>AAS Suite Handbuch</title></head><body></body></html>');
    return;
  }
  const base = normalize(join(buildDir, path));
  const file = [base, join(base, 'index.html'), `${base}.html`].find(
    (candidate) => candidate.startsWith(buildDir) && existsSync(candidate) && statSync(candidate).isFile(),
  );
  if (!file) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;

// HANDBUCH_CHROMIUM: vorhandener Chromium (z. B. im Docker-Build), sonst Chromium von Playwright und
// lokal ohne installierten Playwright-Browser ersatzweise Google Chrome
async function launch() {
  if (process.env.HANDBUCH_CHROMIUM) {
    return chromium.launch({ executablePath: process.env.HANDBUCH_CHROMIUM, chromiumSandbox: false });
  }
  try {
    return await chromium.launch();
  } catch (error) {
    try {
      return await chromium.launch({ channel: 'chrome' });
    } catch {
      throw error;
    }
  }
}

const browser = await launch();
try {
  const page = await browser.newPage({ locale: 'de-DE' });

  // 1. Inhalt jeder Seite aus dem Build lesen
  const chapters = [];
  for (const seite of seiten) {
    if (VIDEO_PAGES.has(seite.permalink.replace(/\/$/, ''))) continue;
    await page.goto(origin + seite.permalink, { waitUntil: 'load' });
    const html = await page.locator('article .theme-doc-markdown').first().innerHTML();
    chapters.push({ ...seite, html });
  }

  // 2. Ein Dokument zusammensetzen: Deckblatt, Inhaltsverzeichnis, Kapitel
  await page.goto(origin + SKELETON_PATH);
  await page.addStyleTag({ content: readFileSync(join(root, 'scripts', 'pdf.css'), 'utf8') });
  await page.evaluate(
    async ({ chapters, edition, stand, imageWidth }) => {
      const keyOf = (permalink) => permalink.replace(/^\/|\/$/g, '').replace(/[^\w-]+/g, '-') || 'start';
      const pages = new Map(chapters.map((chapter) => [chapter.permalink.replace(/\/$/, '') || '/', keyOf(chapter.permalink)]));
      const body = document.body;

      const cover = document.createElement('section');
      cover.className = 'deckblatt';
      cover.innerHTML = `<img class="logo" src="/img/logo.svg" alt="">
        <h1 class="deckblatt-titel">AAS Suite Handbuch</h1>
        <p class="deckblatt-edition">${edition === 'oss' ? 'Community-Edition' : 'Enterprise-Edition'}</p>
        <p class="deckblatt-stand">Stand: ${stand.datum} · Commit ${stand.commit}</p>`;
      body.append(cover);

      const toc = document.createElement('nav');
      toc.className = 'inhalt';
      toc.innerHTML = '<h1 class="inhalt-titel">Inhalt</h1>';
      const list = document.createElement('ol');
      let currentArea = null;
      for (const chapter of chapters) {
        if (chapter.bereich && chapter.bereich !== currentArea) {
          currentArea = chapter.bereich;
          const area = document.createElement('li');
          area.className = 'inhalt-bereich';
          area.textContent = chapter.bereich;
          list.append(area);
        }
        const item = document.createElement('li');
        item.className = chapter.bereich ? 'inhalt-kapitel eingerueckt' : 'inhalt-kapitel';
        item.innerHTML = `<a href="#seite-${keyOf(chapter.permalink)}"></a>`;
        item.firstChild.textContent = chapter.title;
        list.append(item);
      }
      toc.append(list);
      body.append(toc);

      for (const chapter of chapters) {
        const key = keyOf(chapter.permalink);
        const section = document.createElement('section');
        section.className = 'kapitel';
        section.id = `seite-${key}`;
        section.dataset.bereich = chapter.bereich ?? '';
        section.innerHTML = chapter.html;
        if (key === 'stichworte') section.classList.add('stichwortverzeichnis');

        // Nur für die Website: Anker-Symbole, Links auf das PDF selbst, Videos und der hinführende Satz
        section.querySelectorAll('a.hash-link, .pdf-ausblenden, nav[aria-label="Buchstaben"]').forEach((el) => el.remove());
        section.querySelectorAll('a[href$="handbuch.pdf"]').forEach((link) => (link.closest('p, li') ?? link).remove());
        section.querySelectorAll('video').forEach((video) => (video.closest('figure, p') ?? video).remove());
        section.querySelectorAll('p').forEach((paragraph) => {
          const last = paragraph.lastChild;
          if (last?.nodeType === Node.TEXT_NODE && /Das Video zeigt/.test(last.textContent)) {
            last.textContent = last.textContent.replace(/\s*Das Video zeigt[\s\S]*$/, '');
            if (paragraph.textContent.trim() === '') paragraph.remove();
          }
        });
        section.querySelectorAll('details').forEach((details) => (details.open = true));

        // IDs je Kapitel eindeutig machen, Links auf Sprünge im Dokument umstellen
        section.querySelectorAll('[id]').forEach((el) => (el.id = `${key}--${el.id}`));
        section.querySelectorAll('a[href]').forEach((link) => {
          const target = new URL(link.getAttribute('href'), new URL(chapter.permalink, location.origin));
          if (target.origin !== location.origin) return;
          const targetKey = pages.get(target.pathname.replace(/\/$/, '') || '/');
          if (targetKey) {
            const hash = decodeURIComponent(target.hash.slice(1));
            link.setAttribute('href', hash ? `#${targetKey}--${hash}` : `#seite-${targetKey}`);
            link.classList.add('intern');
          } else {
            link.replaceWith(...link.childNodes);
          }
        });
        body.append(section);
      }

      // Screenshots auf Druckgröße verkleinern
      const images = [...body.querySelectorAll('img')];
      images.forEach((img) => img.setAttribute('loading', 'eager'));
      await Promise.all(images.map((img) => img.decode().catch(() => undefined)));
      for (const img of images) {
        if (!/\.png$/i.test(new URL(img.src).pathname) || img.naturalWidth <= imageWidth) continue;
        const canvas = document.createElement('canvas');
        canvas.width = imageWidth;
        canvas.height = Math.round((img.naturalHeight * imageWidth) / img.naturalWidth);
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.imageSmoothingQuality = 'high';
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.src = canvas.toDataURL('image/jpeg', 0.8);
        await img.decode();
      }
    },
    {
      chapters,
      edition,
      stand: { datum: new Date().toLocaleDateString('de-DE', { dateStyle: 'long' }), commit: commit() },
      imageWidth: IMAGE_WIDTH,
    },
  );

  // 3. Seiten umbrechen (Paged.js: Seitenzahlen, Inhaltsverzeichnis, Kopf- und Fußzeilen)
  await page.addScriptTag({ path: PAGED_JS });
  await page.evaluate(async () => {
    await new window.Paged.Previewer().preview();
  });

  // 4. Drucken
  await page.pdf({ path: outFile, preferCSSPageSize: true, printBackground: true, outline: true, tagged: true });
  console.log(`PDF geschrieben: ${outFile} (${Math.round(statSync(outFile).size / 1024)} KB, ${chapters.length} Seiten des Handbuchs)`);
} finally {
  await browser.close();
  server.close();
}
