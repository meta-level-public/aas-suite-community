// Aufnahmen für designer/schnipsel.md
import { expect, test } from '@playwright/test';
import { infrastructureId, paths, useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { closeOverlays, dialog, expandTreeItem, menuItem, openTreeMenu, row, treeItem } from '../lib/ui.mjs';
import { AAS, SCHNIPSEL } from '../seed/demo-daten.mjs';

const DEMO = AAS.kreiselpumpe;

test.describe('Schnipsel', () => {
  const s = useSession(test);

  test('schnipsel-liste', async () => {
    await s.page.goto('my-space/snippets');
    await expect(row(s.page, SCHNIPSEL.name)).toBeVisible();
    await shot(s.page, 'designer/schnipsel-liste');
  });

  test('schnipsel-speichern, schnipsel-einfuegen', async () => {
    await s.page.goto('shells-list');
    await s.page.goto(paths.editor(await infrastructureId(s.page), DEMO.aasId));
    await expandTreeItem(s.page, 'TechnicalData');
    await openTreeMenu(s.page, 'GeneralInformation');
    await menuItem(s.page, 'Speichern als...').click();
    await menuItem(s.page, 'Als Schnipsel speichern').click();
    const save = dialog(s.page);
    await expect(save.getByText('Schnipsel erstellen')).toBeVisible();
    await save.locator('input').filter({ visible: true }).first().fill(SCHNIPSEL.name);
    await shot(s.page, 'designer/schnipsel-speichern');
    // Nicht speichern: der Schnipsel aus dem Seed genügt
    await closeOverlays(s.page);

    await openTreeMenu(s.page, 'TechnicalData');
    await menuItem(s.page, 'Hinzufügen').click();
    await menuItem(s.page, 'Schnipsel').click();
    const insert = dialog(s.page);
    await expect(insert.getByText('Schnipsel einfügen')).toBeVisible();
    await expect(insert.getByText(SCHNIPSEL.name)).toBeVisible();
    await shot(s.page, 'designer/schnipsel-einfuegen');
    await closeOverlays(s.page);
    await expect(treeItem(s.page, 'TechnicalData')).toBeVisible();
  });
});
