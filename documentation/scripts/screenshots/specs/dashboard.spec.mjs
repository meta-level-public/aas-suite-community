// Aufnahmen für designer/dashboard.md. Das Dashboard gibt es nur in Enterprise mit Lizenz.
import { expect, test } from '@playwright/test';
import { useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { button } from '../lib/ui.mjs';

test.describe('Dashboard @enterprise', () => {
  const s = useSession(test);

  test('dashboard-seite-waehlen, dashboard-uebersicht, dashboard-layout-bearbeiten', async () => {
    await s.page.goto('dashboard');
    // Beim ersten Aufruf eines frischen Kontos: Auswahl der Startseite
    await expect(button(s.page, 'Auswählen').first()).toBeVisible();
    await shot(s.page, 'designer/dashboard-seite-waehlen');
    await button(s.page, 'Auswählen').first().click();

    await expect(s.page.getByText('Zuletzt bearbeitete AAS')).toBeVisible();
    await shot(s.page, 'designer/dashboard-uebersicht');

    await button(s.page, 'Layout bearbeiten').click();
    await expect(s.page.getByText('Builder', { exact: true })).toBeVisible();
    await shot(s.page, 'designer/dashboard-layout-bearbeiten');
    await button(s.page, 'Abbrechen').click();
  });
});
