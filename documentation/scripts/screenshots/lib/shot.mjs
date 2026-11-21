// Aufnahme eines Handbuchbildes nach static/img/<bereich>/<thema>.png.
//
//   await shot(page, 'designer/shells-liste');
//   await shot(page, 'designer/editor-menue', {
//     element: page.getByRole('menu'),            // Ausschnitt: Element mit Rand (padding, Standard 16 px)
//     // clip: { x, y, width, height },           // oder fester Ausschnitt; ohne beides: ganzer Viewport
//     marks: [[page.getByRole('button', { name: 'Speichern' }), 1]],  // nummerierte Rahmen = Schritte im Text
//     hide: [page.locator('aas-app-menu')],       // Leisten ausblenden, wenn ein Bild mehr Platz braucht
//     blur: [page.locator('tr.fremd')],           // unkenntlich machen, was die Umgebung Fremdes zeigen könnte
//     replaceText: [[page.locator('.datum'), '21.11.2026 10:00']],  // Serverzeiten fest, damit Läufe gleich sind
//   });
//
// Bildregel (als Prüfung): Alles, was ein Bild zeigt (element) oder markiert (marks), steht ganz und
// unverdeckt im Bild. shot() scrollt jedes Ziel ins Bild, auch seitlich, und bricht mit einer klaren Meldung
// ab, wenn ein Ziel über den Rand ragt oder etwas darüber liegt (Kopfzeile, Seitenleiste, Dialog, Overlay).
import { expect } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { IMG_DIR } from './stack-info.mjs';

// Ladeanzeigen der Anwendung; ein Bild entsteht erst, wenn keine davon sichtbar ist
const BUSY =
  '.p-progressspinner, .p-skeleton, .p-progressbar-indeterminate, .p-datatable-mask, .p-datatable-loading-overlay, [aria-busy="true"]';
// Kurzlebige Einblendungen und Bewegung, die nicht ins Bild gehören
const CAPTURE_CSS = `
  .p-toast { display: none !important; }
  *, *::before, *::after {
    caret-color: transparent !important;
    transition: none !important;
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
`;
const MARK_COLOR = '#f57c00';
// Neues und vorhandenes Bild werden auf ein Viertel verkleinert verglichen; dabei verschwinden Kantenglättung und
// Verschiebungen unter einem Pixel (gemessen: unter 10 Bildpunkte), ein neuer Button ergibt mehrere hundert.
// Bis zu dieser Zahl deutlich abweichender Bildpunkte bleibt die vorhandene Datei stehen.
const UNCHANGED_PIXELS = 20;
const COMPARE_SCALE = 4;
const COMPARE_TOLERANCE = 40;

// Werte, die von Lauf zu Lauf wechseln, vor jeder Aufnahme einheitlich darstellen (und danach zurücksetzen):
// Adresse und Containernamen des Wegwerf-Stacks, Zeitstempel des Servers.
export const FIXED_TIME = '15.06.2026, 09:30';
const NORMALIZE = [
  ['https?://localhost:\\d+', 'https://aas.demo-pumpen.example'],
  ['aas-handbuch-(?:enterprise|oss)-', 'aas-suite-'],
  // 21.11.26, 10:19:34 · 21.11.2026 10:19 · 21.11.2026, 10:19:34
  ['\\b\\d{2}\\.\\d{2}\\.\\d{2}(?:\\d{2})?,?\\s+\\d{2}:\\d{2}(?::\\d{2})?\\b', FIXED_TIME],
];
const MARK_ATTR = 'data-handbuch-mark';

/** Wartet, bis die Seite ruhig ist: Netzwerk, Ladeanzeigen, Schriften, zwei Frames. */
export async function settle(page) {
  await page.waitForLoadState('networkidle');
  await expect(page.locator(BUSY).filter({ visible: true }), 'Ladeanzeige sichtbar').toHaveCount(0);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

function describe(locator) {
  return locator.toString().replace(/^locator\(/, '').slice(0, 160);
}

// Prüft ein Ziel: sichtbar, ganz im Viewport und im Ausschnitt, an keiner Stelle verdeckt
async function checkTarget(page, locator, area, label) {
  const count = await locator.count();
  if (count !== 1) {
    throw new Error(`Bildregel: ${label} ${describe(locator)} trifft ${count} Elemente statt genau eines.`);
  }
  await locator.scrollIntoViewIfNeeded();
  const problem = await locator.evaluate(
    (element, { area }) => {
      const box = element.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return 'ist nicht sichtbar (Größe 0).';
      const viewport = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
      const inside = (outer) =>
        box.left >= outer.x - 0.5 &&
        box.top >= outer.y - 0.5 &&
        box.right <= outer.x + outer.width + 0.5 &&
        box.bottom <= outer.y + outer.height + 0.5;
      if (!inside(viewport)) return `ragt über den Rand des Fensters (${fmt(box)}).`;
      if (area && !inside(area)) return `ragt über den Rand des Ausschnitts (${fmt(box)} außerhalb ${fmt2(area)}).`;
      // Raster aus 3 × 3 Punkten, leicht nach innen versetzt
      for (const fx of [0.1, 0.5, 0.9]) {
        for (const fy of [0.1, 0.5, 0.9]) {
          const x = box.left + box.width * fx;
          const y = box.top + box.height * fy;
          const hit = document.elementFromPoint(x, y);
          if (!hit || element.contains(hit)) continue;
          // Ein Ziel ohne Pointer-Events lässt elementFromPoint durchfallen; das Ziel liegt dann trotzdem oben
          if (hit.contains(element) && getComputedStyle(element).pointerEvents === 'none') continue;
          const name = `${hit.tagName.toLowerCase()}${hit.id ? `#${hit.id}` : ''}${
            typeof hit.className === 'string' && hit.className ? `.${hit.className.trim().split(/\s+/).slice(0, 3).join('.')}` : ''
          }`;
          return `ist bei (${Math.round(x)}, ${Math.round(y)}) verdeckt von <${name}>.`;
        }
      }
      return null;

      function fmt(b) {
        return `${Math.round(b.left)},${Math.round(b.top)} ${Math.round(b.width)}×${Math.round(b.height)}`;
      }
      function fmt2(a) {
        return `${Math.round(a.x)},${Math.round(a.y)} ${Math.round(a.width)}×${Math.round(a.height)}`;
      }
    },
    { area },
  );
  if (problem) throw new Error(`Bildregel: ${label} ${describe(locator)} ${problem}`);
}

// Rahmen mit Nummernkreis ins DOM legen (fest positioniert, über allem)
async function drawMarks(page, marks, area) {
  for (const [locator, number] of marks) {
    await locator.evaluate(
      (element, { number, color, attr, area }) => {
        const box = element.getBoundingClientRect();
        const pad = 4;
        const frame = document.createElement('div');
        frame.setAttribute(attr, '');
        Object.assign(frame.style, {
          position: 'fixed',
          left: `${box.left - pad}px`,
          top: `${box.top - pad}px`,
          width: `${box.width + 2 * pad}px`,
          height: `${box.height + 2 * pad}px`,
          border: `3px solid ${color}`,
          borderRadius: '6px',
          boxSizing: 'border-box',
          zIndex: '2147483646',
          pointerEvents: 'none',
        });
        const size = 26;
        const badge = document.createElement('div');
        badge.setAttribute(attr, '');
        badge.textContent = String(number);
        // Kreis links oben am Rahmen; bleibt innerhalb des Ausschnitts bzw. Fensters
        const bounds = area ?? { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
        const left = Math.min(Math.max(box.left - pad - size / 2, bounds.x + 2), bounds.x + bounds.width - size - 2);
        const top = Math.min(Math.max(box.top - pad - size / 2, bounds.y + 2), bounds.y + bounds.height - size - 2);
        Object.assign(badge.style, {
          position: 'fixed',
          left: `${left}px`,
          top: `${top}px`,
          width: `${size}px`,
          height: `${size}px`,
          lineHeight: `${size}px`,
          borderRadius: '50%',
          background: color,
          color: '#fff',
          font: '700 15px/26px system-ui, sans-serif',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,.35)',
          zIndex: '2147483647',
          pointerEvents: 'none',
        });
        document.body.append(frame, badge);
      },
      { number, color: MARK_COLOR, attr: MARK_ATTR, area },
    );
  }
}

/**
 * Nimmt ein Handbuchbild auf.
 * @param {import('@playwright/test').Page} page
 * @param {string} name Pfad unter static/img ohne Endung, z. B. 'designer/shells-liste'
 * @param {{
 *   element?: import('@playwright/test').Locator, padding?: number,
 *   clip?: { x: number, y: number, width: number, height: number },
 *   marks?: Array<[import('@playwright/test').Locator, number]>,
 *   hide?: import('@playwright/test').Locator[],
 *   blur?: import('@playwright/test').Locator[],
 *   replaceText?: Array<[import('@playwright/test').Locator, string]>,
 * }} [options]
 */
export async function shot(page, name, options = {}) {
  const { element, padding = 16, clip, marks = [], hide = [], blur = [], replaceText = [] } = options;
  if (element && clip) throw new Error('shot(): entweder element oder clip angeben, nicht beides.');

  await settle(page);
  const style = await page.addStyleTag({ content: CAPTURE_CSS });
  const restores = [];
  try {
    for (const locator of hide) {
      restores.push(await setStyle(locator, 'visibility', 'hidden'));
    }
    for (const locator of blur) {
      restores.push(await setStyle(locator, 'filter', 'blur(6px)'));
    }
    for (const [locator, text] of replaceText) {
      restores.push(await setText(locator, text));
    }
    restores.push(await normalize(page));

    // Ausschnitt bestimmen; das Element selbst unterliegt ebenfalls der Bildregel
    let area = clip ?? null;
    if (element) {
      await checkTarget(page, element, null, 'Ausschnitt');
      const box = await element.boundingBox();
      const viewport = page.viewportSize();
      const x = Math.max(0, box.x - padding);
      const y = Math.max(0, box.y - padding);
      area = {
        x,
        y,
        width: Math.min(viewport.width, box.x + box.width + padding) - x,
        height: Math.min(viewport.height, box.y + box.height + padding) - y,
      };
    }
    for (const [locator, number] of marks) {
      await checkTarget(page, locator, area, `Markierung ${number}`);
    }
    // Scrollen für spätere Ziele kann frühere verschoben haben: alle noch einmal ohne Scrollen prüfen
    if (element) await checkTarget(page, element, null, 'Ausschnitt');
    for (const [locator, number] of marks) {
      await checkTarget(page, locator, area, `Markierung ${number}`);
    }

    await drawMarks(page, marks, area);
    const path = join(IMG_DIR, `${name}.png`);
    mkdirSync(dirname(path), { recursive: true });
    const image = await page.screenshot({ animations: 'disabled', caret: 'hide', ...(area ? { clip: area } : {}) });
    if (!existsSync(path) || (await changedPixels(page, readFileSync(path), image)) > UNCHANGED_PIXELS) {
      writeFileSync(path, image);
    }
  } finally {
    await page.evaluate((attr) => document.querySelectorAll(`[${attr}]`).forEach((n) => n.remove()), MARK_ATTR);
    for (const restore of restores.reverse()) await restore();
    await style.evaluate((node) => node.remove());
  }
}

async function setStyle(locator, property, value) {
  const previous = await locator.evaluateAll(
    (elements, { property, value }) =>
      elements.map((element) => {
        const old = element.style.getPropertyValue(property);
        element.style.setProperty(property, value, 'important');
        return old;
      }),
    { property, value },
  );
  return () =>
    locator.evaluateAll(
      (elements, { property, previous }) =>
        elements.forEach((element, i) =>
          previous[i] ? element.style.setProperty(property, previous[i]) : element.style.removeProperty(property),
        ),
      { property, previous },
    );
}

async function setText(locator, text) {
  const previous = await locator.evaluateAll(
    (elements, text) =>
      elements.map((element) => {
        const old = element.textContent;
        element.textContent = text;
        return old;
      }),
    text,
  );
  return () =>
    locator.evaluateAll(
      (elements, previous) => elements.forEach((element, i) => (element.textContent = previous[i])),
      previous,
    );
}

// Ersetzt NORMALIZE in Textknoten und Eingabefeldern; gibt eine Funktion zum Zurücksetzen zurück
async function normalize(page) {
  await page.evaluate((rules) => {
    const patterns = rules.map(([source, replacement]) => [new RegExp(source, 'g'), replacement]);
    const apply = (text) => patterns.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text);
    const changed = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const next = apply(node.nodeValue);
      if (next !== node.nodeValue) {
        changed.push({ node, value: node.nodeValue });
        node.nodeValue = next;
      }
    }
    for (const field of document.querySelectorAll('input, textarea')) {
      const next = apply(field.value);
      if (next !== field.value) {
        changed.push({ field, value: field.value });
        field.value = next;
      }
    }
    window.__handbuchNormalized = changed;
  }, NORMALIZE);
  return () =>
    page.evaluate(() => {
      for (const entry of window.__handbuchNormalized ?? []) {
        if (entry.node) entry.node.nodeValue = entry.value;
        else entry.field.value = entry.value;
      }
      delete window.__handbuchNormalized;
    });
}

// Zahl deutlich abweichender Bildpunkte zweier PNG-Bilder nach Verkleinerung (Infinity bei anderer Größe)
async function changedPixels(page, before, after) {
  if (before.equals(after)) return 0;
  const helper = await page.context().browser().newPage();
  try {
    return await helper.evaluate(
      async ({ a, b, scale, tolerance }) => {
        const load = (data) =>
          new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = `data:image/png;base64,${data}`;
          });
        const [imageA, imageB] = await Promise.all([load(a), load(b)]);
        if (imageA.width !== imageB.width || imageA.height !== imageB.height) return Infinity;
        const width = Math.ceil(imageA.width / scale);
        const height = Math.ceil(imageA.height / scale);
        const pixels = (image) => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          context.imageSmoothingQuality = 'high';
          context.drawImage(image, 0, 0, width, height);
          return context.getImageData(0, 0, width, height).data;
        };
        const pa = pixels(imageA);
        const pb = pixels(imageB);
        let changed = 0;
        for (let i = 0; i < pa.length; i += 4) {
          const delta = Math.max(Math.abs(pa[i] - pb[i]), Math.abs(pa[i + 1] - pb[i + 1]), Math.abs(pa[i + 2] - pb[i + 2]));
          if (delta > tolerance) changed++;
        }
        return changed;
      },
      { a: before.toString('base64'), b: after.toString('base64'), scale: COMPARE_SCALE, tolerance: COMPARE_TOLERANCE },
    );
  } finally {
    await helper.close();
  }
}
