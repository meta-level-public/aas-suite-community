#!/usr/bin/env node
// Öffnet Chrome für eine einmalige Anmeldung am Designer und speichert die Sitzung lokal
// (scripts/screenshots/.auth/, nicht eingecheckt). Danach erzeugt capture.mjs die Screenshots.
// Aufruf: npm run screenshots:login  (BASE_URL überschreibt die Adresse des Designers)
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { AUTH_FILE, AUTH_DIR, BASE_URL, VIEWPORT } from './config.mjs';

mkdirSync(AUTH_DIR, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: false });
const context = await browser.newContext({ viewport: VIEWPORT, locale: 'de-DE' });
const page = await context.newPage();
await page.goto(BASE_URL);

console.log('Bitte im geöffneten Chrome-Fenster anmelden. Die Sitzung wird gespeichert, sobald das Dashboard erscheint.');
await page.waitForURL(/\/designer-ui\/(dashboard|shells-list)/, { timeout: 30 * 60 * 1000 });
await page.waitForLoadState('networkidle');

await context.storageState({ path: AUTH_FILE });
console.log(`Sitzung gespeichert: ${AUTH_FILE}`);
await browser.close();
