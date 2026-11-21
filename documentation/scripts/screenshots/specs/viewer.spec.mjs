// Aufnahmen für designer/viewer.md
import { expect, test } from '@playwright/test';
import { infrastructureId, paths, useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { closeOverlays, dialog } from '../lib/ui.mjs';
import { AAS } from '../seed/demo-daten.mjs';

test.describe('Viewer', () => {
  const s = useSession(test);

  test('viewer-typenschild, viewer-technische-daten, viewer-json', async () => {
    await s.page.goto('shells-list');
    await s.page.goto(paths.viewer(await infrastructureId(s.page), AAS.kreiselpumpe.aasId));
    await expect(s.page.getByText('Formatierte Anzeige', { exact: true })).toBeVisible();
    await shot(s.page, 'designer/viewer-typenschild');

    await s.page.getByText('TechnicalData', { exact: true }).filter({ visible: true }).first().click();
    await expect(s.page.getByText('Technical Data', { exact: true }).first()).toBeVisible();
    await shot(s.page, 'designer/viewer-technische-daten');

    await s.page.getByText('JSON Ansicht', { exact: true }).click();
    await expect(s.page.getByText('"idShort"').first()).toBeVisible();
    await shot(s.page, 'designer/viewer-json');
  });

  test('viewer-suche', async () => {
    await s.page.goto('shells-list');
    await s.page.goto(paths.viewer(await infrastructureId(s.page), AAS.kreiselpumpe.aasId));
    await expect(s.page.getByText('Formatierte Anzeige', { exact: true })).toBeVisible();
    // Der Such-Button hat nur ein Symbol und einen Tooltip
    await s.page.locator('button:has(.pi-search)').filter({ visible: true }).first().click();
    const search = dialog(s.page);
    await search.getByPlaceholder('Suchbegriff').fill('Pumpe');
    await search.getByRole('button', { name: 'Durchsuchen' }).click();
    await expect(search.getByText('ManufacturerProductDesignation').first()).toBeVisible();
    await shot(s.page, 'designer/viewer-suche');
    await closeOverlays(s.page);
  });
});
