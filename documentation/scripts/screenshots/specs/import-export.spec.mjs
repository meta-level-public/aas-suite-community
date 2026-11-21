// Aufnahmen für designer/import-export.md
import { expect, test } from '@playwright/test';
import { useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { button, closeOverlays, dialog, menuItem, openShellRowMenu } from '../lib/ui.mjs';
import { AAS } from '../seed/demo-daten.mjs';

test.describe('Import und Export', () => {
  const s = useSession(test);

  test('shells-menue-exportieren, export-aasx', async () => {
    await openShellRowMenu(s.page, AAS.kreiselpumpe.idShort);
    await menuItem(s.page, 'Exportieren').click();
    await expect(menuItem(s.page, 'Export *.aasx')).toBeVisible();
    await shot(s.page, 'designer/shells-menue-exportieren');

    await menuItem(s.page, 'Export *.aasx').click();
    await expect(dialog(s.page).getByText('Aasx Exportformat')).toBeVisible();
    await shot(s.page, 'designer/export-aasx');
    await closeOverlays(s.page);
  });

  test('import-aasx', async () => {
    await s.page.goto('shells-list');
    await button(s.page, 'Hinzufügen').click();
    await menuItem(s.page, 'AASX hochladen').click();
    await expect(dialog(s.page).getByText('Importmodus wählen')).toBeVisible();
    await shot(s.page, 'designer/import-aasx');
    await closeOverlays(s.page);
  });
});
