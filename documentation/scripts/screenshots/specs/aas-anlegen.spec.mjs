// Aufnahmen für designer/aas-anlegen.md und designer/assistenten.md (geführter Modus).
// Speichert nichts: Die Dosierpumpe DP-50 darf nicht existieren, damit die ID-Prüfung „Verfügbar" meldet.
import { expect, test } from '@playwright/test';
import { useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { button } from '../lib/ui.mjs';

const WIZARD_DEMO = { descriptionEn: 'Demo dosing pump DP-50', descriptionDe: 'Demo-Dosierpumpe DP-50' };

// Karten der Startseite des geführten Modus in Anzeigereihenfolge
const CARD = { instanz: 0, typ: 1, batteriepass: 3, dpp: 4 };

async function startGuidedMode(page, card) {
  await page.goto('aas');
  await expect(page.getByText('Spezialisierte Assistenten')).toBeVisible();
  await button(page, 'Auswählen').nth(card).click();
  await page.waitForURL(/generator\/asset-metadata/);
}

async function next(page) {
  await button(page, 'Weiter').click();
}

test.describe('AAS anlegen', () => {
  const s = useSession(test);

  test('gefuehrter-modus', async () => {
    await s.page.goto('aas');
    await expect(s.page.getByText('Spezialisierte Assistenten')).toBeVisible();
    await shot(s.page, 'designer/gefuehrter-modus');
  });

  test('assistent-basisdaten bis assistent-zusammenfassung', async () => {
    await startGuidedMode(s.page, CARD.instanz);
    const descriptions = s.page.locator('aas-multilanguage-property textarea').filter({ visible: true });
    await descriptions.nth(0).fill(WIZARD_DEMO.descriptionEn);
    await descriptions.nth(1).fill(WIZARD_DEMO.descriptionDe);
    await shot(s.page, 'designer/assistent-basisdaten');

    await next(s.page);
    await expect(s.page.getByText('Prüfe die erzeugten Kennungen').first()).toBeVisible();
    await expect(s.page.getByText('Verfügbar', { exact: true })).toBeVisible();
    await shot(s.page, 'designer/assistent-kennungen');

    await next(s.page);
    await next(s.page);
    await s.page.waitForURL(/generator\/nameplate/);
    await shot(s.page, 'designer/assistent-typenschild');

    // Durch die Typenschild-Schritte bis zu den Dokumenten
    for (let i = 0; i < 60 && !/generator\/document/.test(s.page.url()); i++) {
      await next(s.page);
      await s.page.waitForLoadState('networkidle');
    }
    await s.page.waitForURL(/generator\/document/);
    await shot(s.page, 'designer/assistent-dokumente');

    await next(s.page);
    await s.page.waitForURL(/confirmation/);
    await shot(s.page, 'designer/assistent-zusammenfassung');
  });

  test('assistent-batteriepass, assistent-dpp', async () => {
    await startGuidedMode(s.page, CARD.batteriepass);
    await shot(s.page, 'designer/assistent-batteriepass');
    await startGuidedMode(s.page, CARD.dpp);
    await shot(s.page, 'designer/assistent-dpp');
  });
});
