// Aufnahmen für designer/typ-und-instanz.md
import { expect, test } from '@playwright/test';
import { useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { dialog, menuItem, openShellRowMenu } from '../lib/ui.mjs';
import { AAS } from '../seed/demo-daten.mjs';

test.describe('Typ und Instanz', () => {
  const s = useSession(test);

  test('shells-menue-erweitert, instanz-erstellen', async () => {
    await openShellRowMenu(s.page, AAS.kreiselpumpeTyp.idShort);
    await menuItem(s.page, 'Erweitert').click();
    await expect(menuItem(s.page, 'Instanz erstellen')).toBeVisible();
    await shot(s.page, 'designer/shells-menue-erweitert');

    await menuItem(s.page, 'Instanz erstellen').click();
    const create = dialog(s.page);
    await expect(create.getByText('Seriennummer')).toBeVisible();
    await create.locator('input').filter({ visible: true }).first().fill('SN-DEMO-0002');
    await shot(s.page, 'designer/instanz-erstellen');
    // Nicht speichern: keine Änderung an den Demo-Daten
    await create.getByRole('button', { name: 'Abbrechen' }).click();
  });
});
