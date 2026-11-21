// Aufnahmen für designer/geteilte-links.md
import { expect, test } from '@playwright/test';
import { newSession, useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { dialog, menuItem, openShellRowMenu, row } from '../lib/ui.mjs';
import { AAS, GETEILTER_LINK } from '../seed/demo-daten.mjs';

test.describe('Geteilte Links', () => {
  const s = useSession(test);

  test('geteilter-link-erzeugen', async () => {
    await openShellRowMenu(s.page, AAS.kreiselpumpe.idShort);
    await menuItem(s.page, 'Link zum Teilen erzeugen').click();
    const create = dialog(s.page);
    await create.locator('textarea').fill(GETEILTER_LINK.notiz);
    await shot(s.page, 'designer/geteilter-link-erzeugen');
    // Nicht speichern: der Link aus dem Seed genügt
    await create.getByRole('button', { name: 'Abbrechen' }).click();
  });

  test('geteilte-links, public-viewer', async ({ browser }) => {
    await s.page.goto('my-space/shared-links');
    const link = row(s.page, AAS.kreiselpumpe.idShort);
    await expect(link).toBeVisible();
    await shot(s.page, 'designer/geteilte-links');

    // Der öffentliche Viewer läuft ohne Anmeldung
    const href = await link.locator('a').first().getAttribute('href');
    const accessCode = new URL(href, s.page.url()).searchParams.get('accesscode');
    const viewer = await newSession(browser, { anonymous: true });
    await viewer.goto(`public-viewer?accesscode=${accessCode}`);
    await expect(viewer.getByText('Formatierte Anzeige', { exact: true })).toBeVisible();
    await shot(viewer, 'designer/public-viewer');
    await viewer.context().close();
  });
});
