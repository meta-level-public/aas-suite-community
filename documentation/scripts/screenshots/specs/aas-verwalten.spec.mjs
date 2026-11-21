// Aufnahmen für designer/aas-verwalten.md
import { expect, test } from '@playwright/test';
import { useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { button, closeOverlays, dialog, menuItem, openShellRowMenu } from '../lib/ui.mjs';
import { AAS } from '../seed/demo-daten.mjs';

test.describe('AAS verwalten', () => {
  const s = useSession(test);

  test('shells-liste', async () => {
    await s.page.goto('shells-list');
    const rows = s.page.locator('table tbody tr');
    for (const { idShort } of Object.values(AAS)) {
      await expect(rows.filter({ hasText: idShort })).toBeVisible();
    }
    await shot(s.page, 'designer/shells-liste');
  });

  test('shells-hinzufuegen', async () => {
    await s.page.goto('shells-list');
    await button(s.page, 'Hinzufügen').click();
    const menu = s.page.getByRole('menu').filter({ visible: true });
    await expect(menu.getByRole('menuitem', { name: 'AASX hochladen' })).toBeVisible();
    await shot(s.page, 'designer/shells-hinzufuegen');
    await closeOverlays(s.page);
  });

  test('teilmodelle-liste', async () => {
    await s.page.goto('submodels');
    await expect(s.page.locator('table tbody tr').filter({ hasText: 'TechnicalData' }).first()).toBeVisible();
    await shot(s.page, 'designer/teilmodelle-liste');
  });

  test('konzeptbeschreibungen-liste', async () => {
    await s.page.goto('cds-list');
    await expect(s.page.locator('table tbody tr').first()).toBeVisible();
    await shot(s.page, 'designer/konzeptbeschreibungen-liste');
  });

  test('shells-suche', async () => {
    await s.page.goto('shells-list');
    // Der zweite Button „Durchsuchen" öffnet die Suche; der erste gehört zur AssetID-Schnellsuche
    await button(s.page, 'Durchsuchen').last().click();
    const search = dialog(s.page, 'Suche nach AAS');
    await search.getByRole('textbox', { name: 'idShort' }).fill('demoKreiselpumpe');
    await search.getByRole('button', { name: 'Durchsuchen' }).click();
    await expect(search.getByText(AAS.kreiselpumpeTyp.idShort).first()).toBeVisible();
    await shot(s.page, 'designer/shells-suche');
    await closeOverlays(s.page);
  });

  test('registry-korrektur', async () => {
    await openShellRowMenu(s.page, AAS.kreiselpumpe.idShort);
    await menuItem(s.page, 'Erweitert').click();
    await menuItem(s.page, 'Registry-Korrektur').click();
    await expect(s.page.getByRole('heading', { name: 'Registry-Descriptor' })).toBeVisible();
    await shot(s.page, 'designer/registry-korrektur');
  });
});
