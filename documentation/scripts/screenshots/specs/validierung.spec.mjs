// Aufnahmen für designer/validierung.md (mit der absichtlich fehlerhaften Versuchspumpe aus dem Seed)
import { expect, test } from '@playwright/test';
import { infrastructureId, paths, useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { closeOverlays, dialog, menuItem, treeItem } from '../lib/ui.mjs';
import { AAS } from '../seed/demo-daten.mjs';

const DEMO = AAS.versuchspumpe;

test.describe('Validierung', () => {
  const s = useSession(test);

  test('validierung-menue, validierung-ergebnis', async () => {
    await s.page.goto('shells-list');
    await s.page.goto(paths.editor(await infrastructureId(s.page), DEMO.aasId));
    await expect(treeItem(s.page, DEMO.idShort)).toBeVisible();
    await s.page.locator('.p-splitbutton-dropdown').filter({ visible: true }).first().click();
    await expect(menuItem(s.page, 'IDs validieren')).toBeVisible();
    await shot(s.page, 'designer/validierung-menue');

    await menuItem(s.page, 'Validieren').click();
    await expect(dialog(s.page).getByText('Validierungsergebnisse')).toBeVisible();
    await shot(s.page, 'designer/validierung-ergebnis');
    await closeOverlays(s.page);
  });

  test('validierung-erweitert, id-validierung', async () => {
    await s.page.goto('shells-list');
    await s.page.goto(paths.editor(await infrastructureId(s.page), DEMO.aasId));
    await expect(treeItem(s.page, DEMO.idShort)).toBeVisible();
    await s.page.locator('.p-splitbutton-dropdown').filter({ visible: true }).first().click();
    await menuItem(s.page, 'Validieren').click();
    const result = dialog(s.page);
    await result.getByRole('switch').click();
    await expect(result.getByText('Objektpfad').first()).toBeVisible();
    await shot(s.page, 'designer/validierung-erweitert');
    await closeOverlays(s.page);

    await s.page.locator('.p-splitbutton-dropdown').filter({ visible: true }).first().click();
    await menuItem(s.page, 'IDs validieren').click();
    await expect(dialog(s.page, 'ID Validierung')).toBeVisible();
    await shot(s.page, 'designer/id-validierung');
    await closeOverlays(s.page);
  });
});
