// Meldet das Demo-Konto an, speichert die Sitzung für alle Aufnahmen und legt die Demo-Daten an.
// Läuft einmal vor allen Aufnahmen (Projekt "setup" in playwright.config.mjs).
import { expect, test as setup } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { api, applyPreferences, login, loginAgain } from '../lib/app.mjs';
import { readStackInfo } from '../lib/stack-info.mjs';
import { seed } from '../seed/seed.mjs';

const stack = readStackInfo();

setup('Anmelden und Demo-Daten anlegen', async ({ browser }) => {
  // Wartet u. a. auf die IDTA-Vorlagen aus GitHub
  setup.setTimeout(15 * 60_000);
  const context = await browser.newContext({ baseURL: stack.designerUrl });
  await applyPreferences(context);
  const page = await context.newPage();

  // API-Pfade aus der Laufzeitkonfiguration des Frontends
  let config;
  page.on('response', async (response) => {
    if (config || !response.headers()['content-type']?.includes('json')) return;
    const body = await response.json().catch(() => null);
    if (typeof body?.aasApiPath === 'string') config = body;
  });

  await login(page, stack.account);

  // Enterprise: Test-Lizenz hochladen (wie Systemverwaltung › Lizenz), danach neu laden, damit der
  // Lizenzhinweis verschwindet und lizenzpflichtige Ansichten erscheinen
  if (stack.licenseFile) {
    const result = await api(page, `${stack.baseUrl}/designer-api/system-management-api/SystemManagement/UpdateLicense`, {
      method: 'POST',
      // Wie die Oberfläche (FileReader.readAsDataURL): als Data-URL
      json: {
        licenseAsBase64: `data:application/json;base64,${readFileSync(stack.licenseFile).toString('base64')}`,
        licensee: 'Demo',
      },
    });
    // Status 0 = Success (LicenseUpdateStatus), je nach Serialisierung als Zahl oder Text
    expect(['0', 'Success'], 'Ergebnis des Lizenz-Uploads').toContain(String(result.status));
    await page.reload();
  }
  await expect.poll(() => config, { message: 'Laufzeitkonfiguration des Frontends' }).toBeTruthy();
  // Erst importieren, wenn der Designer eine AAS-Infrastruktur gewählt hat; sonst fehlt das Ziel des Imports
  await page.goto('shells-list');
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('CURRENT_AAS_INFRASTRUCTURE') || '{}').id), {
      message: 'gewählte AAS-Infrastruktur',
    })
    .toBeGreaterThan(0);

  await seed(page, config, stack.account);
  await context.close();
  // Neu anmelden, damit die Sitzung die eben vergebenen Rechte enthält, und für alle Aufnahmen speichern
  await loginAgain(browser);
});
