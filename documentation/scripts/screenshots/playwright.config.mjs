// Playwright-Konfiguration für die Handbuch-Aufnahmen. Getrennt von den E2E-Tests unter frontend/apps/*-e2e.
// Läuft gegen den Wegwerf-Stack aus stack.mjs; Start über `npm run screenshots` (siehe run.mjs).
import { defineConfig } from '@playwright/test';
import { CONTEXT_OPTIONS } from './lib/capture-options.mjs';
import { EDITION, readStackInfo } from './lib/stack-info.mjs';

const stack = readStackInfo();

export default defineConfig({
  testDir: './specs',
  // Aufnahmen verändern teils Demo-Daten und nehmen die Änderung selbst zurück: strikt nacheinander
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  outputDir: './.stack/test-results',
  reporter: [['list']],
  // Enterprise-Aufnahmen (Markt, Betrieb/Enterprise) nur im Enterprise-Lauf
  grepInvert: EDITION === 'oss' ? /@enterprise/ : undefined,
  use: {
    baseURL: stack.designerUrl,
    ...CONTEXT_OPTIONS,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? 'chrome',
    headless: process.env.HEADED !== '1',
    // Gleichbleibende Grafikausgabe: gleiche Eingabe ergibt pixelgleiche Bilder (Verläufe, Kantenglättung)
    launchOptions: {
      args: [
        '--force-color-profile=srgb',
        '--disable-gpu',
        '--disable-gpu-rasterization',
        '--disable-lcd-text',
        '--font-render-hinting=none',
        '--disable-skia-runtime-opts',
        '--disable-partial-raster',
      ],
    },
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /setup\.mjs$/ },
    {
      name: 'aufnahmen',
      testMatch: /\.spec\.mjs$/,
      dependencies: ['setup'],
      use: { storageState: stack.authFile },
    },
  ],
});
